package ws

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/alphadose/haxmap"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
	"golang.org/x/exp/slog"
)

var (
	ErrLeavingOwnRoom     = errors.New("trying to leave own room")
	ErrLeavingGloabalRoom = errors.New("client trying to leave global room")
)

type Client struct {
	ID        string
	Manager   *Manager
	Conn      *websocket.Conn
	Rooms     *haxmap.Map[string, *Room]
	logger    *slog.Logger
	sendCh    chan *Packet
	receiveCh chan *Packet
	quitCh    chan struct{}
}

func NewClient(conn *websocket.Conn, cID string, m *Manager) *Client {
	c := &Client{
		ID:        cID,
		Manager:   m,
		Conn:      conn,
		Rooms:     haxmap.New[string, *Room](),
		logger:    slog.With("client", cID),
		sendCh:    make(chan *Packet, 10),
		receiveCh: make(chan *Packet, 10),
		quitCh:    make(chan struct{}),
	}

	go c.write()
	go c.read()

	return c
}

func (c *Client) write() {
	for p := range c.sendCh {
		if err := c.Conn.WriteJSON(p); err != nil {
			c.logger.Error("write packet", err)
		}
	}
}

func (c *Client) send(p *Packet) {
	c.sendCh <- p
}

func (c *Client) read() {
	go c.receive()

	for {
		p := &Packet{}
		err := c.Conn.ReadJSON(p)
		if err != nil {
			var syntaxError *json.SyntaxError
			if errors.As(err, &syntaxError) {
				c.logger.Info("json syntax error in packet", syntaxError)
				continue
			}
			c.quitCh <- struct{}{}
			return
		}

		c.receiveCh <- p
	}
}

func (c *Client) receive() {
	for p := range c.receiveCh {
		c.logger.Info("received packet", "event", p.Event)
		if err := c.handlePacket(p); err != nil {
			c.logger.Error("handlePacket", err)
		}
	}
}

func (c *Client) handlePacket(p *Packet) error {
	switch p.Event {
	case ClientEventNoEvent:
		c.logger.Info("received packet with no action")
	case ClientEventChatMessage:
		return c.HandleChatMessage(p)
	case ClientEventJoinRoom:
		return c.HandleJoinRoomRequest(p)
	case ClientEventJoinDMRoom:
		return c.HandleJoinDMRoomRequest(p)
	case ClientEventCreateRoom:
		return c.HandleCreateRoomRequest(p)
	case ClientEventLeaveRoom:
		return c.HandleLeaveRoomRequest(p)
	}

	return nil
}

func (c *Client) HandleChatMessage(p *Packet) error {
	payload := ChatMessage{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return fmt.Errorf("failed to unmarshal ChatMessage: %w", err)
	}
	slog.Info("room-message", "payload", payload)

	r, err := c.Manager.GetRoom(payload.RoomID)
	if err != nil {
		return fmt.Errorf("ChatMessage: %w", err)
	}

	if !r.has(c.ID) {
		return fmt.Errorf("%w %s", ErrNotInRoom, payload.RoomID)
	}

	payload.Timestamp = time.Now().UTC()

	if err := r.Manager.MessageRepo.InsertOne(r.ID, &payload); err != nil {
		slog.Error("failed to insert message in db", err)
	}

	if err := p.setPayload(payload); err != nil {
		return err
	}
	r.Broadcast(p)

	return nil
}

func (c *Client) HandleJoinRoomRequest(p *Packet) error {
	payload := JoinRoomPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	r, err := c.Manager.GetRoom(payload.RoomID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "room not found: "+err.Error())
	}

	if err = c.Manager.RoomSvc.AddUser(payload.RoomID, c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to join room: "+err.Error())
	}
	if err = c.Manager.UserSvc.Repo.AddJoinedRoom(payload.RoomID, c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to add user to room"+err.Error())
	}
	if err = r.AddClient(c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to join ws room: "+err.Error())
	}

	return nil
}

func (c *Client) HandleJoinDMRoomRequest(p *Packet) error {
	payload := JoinDMPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	// Create room with both users in it
	roomName := fmt.Sprintf("%s/%s", payload.Username, payload.ToUsername)
	dbRoom, err := c.Manager.RoomSvc.CreateRoom(
		uuid.NewString(),
		roomName,
		c.ID,
		payload.ToID,
	)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create new room: "+err.Error())
	}

	// Add room to joinedRoom for both users
	err = c.Manager.UserSvc.Repo.AddJoinedRoom(dbRoom.ID, c.ID)
	if err != nil {
		return fmt.Errorf("add user to room: %w", err)
	}
	err = c.Manager.UserSvc.Repo.AddJoinedRoom(dbRoom.ID, payload.ToID)
	if err != nil {
		return fmt.Errorf("add user to room: %w", err)
	}

	r := c.Manager.AddRoom(dbRoom.ID, dbRoom.Name)
	err = r.AddClient(c.ID)
	if err != nil {
		slog.Error("error:", err)
	}
	err = r.AddClient(payload.ToID)
	if err != nil {
		slog.Error("error:", err)
	}

	return nil
}

func (c *Client) HandleCreateRoomRequest(p *Packet) error {
	payload := CreateRoomPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	payload.UserIDs = append(payload.UserIDs, c.ID)
	dbRoom, err := c.Manager.RoomSvc.CreateRoom(uuid.NewString(), payload.RoomName, payload.UserIDs...)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create new room: "+err.Error())
	}
	slog.Info("dbRoom created", "dbRoom", dbRoom)
	r := c.Manager.AddRoom(dbRoom.ID, dbRoom.Name)
	for _, uID := range payload.UserIDs {
		if err := c.Manager.UserSvc.Repo.AddJoinedRoom(dbRoom.ID, uID); err != nil {
			slog.Error("failed to add user to room", err)
		}
		if err = r.AddClient(uID); err != nil {
			slog.Error("error:", err)
		}
	}

	return nil
}

func (c *Client) HandleLeaveRoomRequest(p *Packet) error {
	payload := LeaveRoomPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	if payload.RoomID == c.ID {
		return fiber.NewError(fiber.StatusBadRequest, "You cannot leave your own room")
	}
	if payload.RoomID == c.Manager.GlobalRoom.ID {
		return fiber.NewError(fiber.StatusBadRequest, "You cannot leave the global room")
	}

	r, err := c.Manager.GetRoom(payload.RoomID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "room not found: "+err.Error())
	}
	if err = c.Manager.RoomSvc.RemoveUser(payload.RoomID, c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to remove user from room: "+err.Error())
	}
	if err = c.Manager.UserSvc.LeaveRoom(payload.RoomID, c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to remove room from user joined rooms: "+err.Error())
	}
	if err = r.RemoveClient(c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to leave ws room: "+err.Error())
	}

	return nil
}
