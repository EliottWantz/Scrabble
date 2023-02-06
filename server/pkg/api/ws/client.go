package ws

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/alphadose/haxmap"
	"github.com/gofiber/websocket/v2"
	"golang.org/x/exp/slog"
)

var ErrLeavingOwnRoom = errors.New("trying to leave own room")

type Client struct {
	ID        string
	Manager   *Manager
	Conn      *websocket.Conn
	Rooms     *haxmap.Map[string, *Room]
	logger    *slog.Logger
	sendCh    chan *Packet
	receiveCh chan *Packet
}

func NewClient(conn *websocket.Conn, cID string, m *Manager) *Client {
	c := &Client{
		ID:        cID,
		Manager:   m,
		Conn:      conn,
		Rooms:     haxmap.New[string, *Room](),
		sendCh:    make(chan *Packet, 10),
		receiveCh: make(chan *Packet, 10),
	}
	c.logger = slog.With("client", c.ID)

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
				c.logger.Warn("json syntax error in packet", "msg", syntaxError)
				continue
			}
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure, websocket.CloseNoStatusReceived) {
				c.logger.Error("client read packet", err)
				return
			}

			c.logger.Error("read error", err)
			return
		}

		c.receiveCh <- p
	}
}

func (c *Client) receive() {
	for p := range c.receiveCh {
		c.logger.Info("received packet", "packet", p)
		if err := c.handlePacket(p); err != nil {
			c.logger.Error("handlePacket", err)
		}
	}
}

func (c *Client) handlePacket(p *Packet) error {
	switch p.Event {
	case ClientEventNoEvent:
		c.logger.Info("received packet with no action")
	case ClientEventJoin:
		return c.joinRoom(p)
	case ClientEventLeave:
		return c.leaveRoom(p)
	case ClientEventBroadcast:
		return c.broadcast(p)
	}

	return nil
}

func (c *Client) joinRoom(p *Packet) error {
	req := JoinPayload{}
	if err := json.Unmarshal(p.Payload, &req); err != nil {
		return err
	}

	r, err := c.Manager.getRoom(req.RoomID)
	if err != nil {
		return err
	}

	if err := r.addClient(c.ID); err != nil {
		return err
	}

	return nil
}

func (c *Client) leaveRoom(p *Packet) error {
	req := LeavePayload{}
	if err := json.Unmarshal(p.Payload, &req); err != nil {
		return err
	}

	if req.RoomID == c.ID {
		return ErrLeavingOwnRoom
	}
	r, err := c.Manager.getRoom(req.RoomID)
	if err != nil {
		return err
	}

	if err = r.removeClient(c.ID); err != nil {
		return err
	}

	return nil
}

func (c *Client) broadcast(p *Packet) error {
	req := BroadcastPayload{}
	if err := json.Unmarshal(p.Payload, &req); err != nil {
		return err
	}

	r, err := c.Manager.getRoom(req.RoomID)
	if err != nil {
		return fmt.Errorf("broadcast: %w", err)
	}

	if !r.has(c.ID) {
		return fmt.Errorf("%w %s", ErrNotInRoom, req.RoomID)
	}

	req.Timestamp = time.Now()
	payload, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("can't create broadcast payload: %w", err)
	}
	p.Payload = payload
	r.broadcast(p, c.ID)

	return nil
}
