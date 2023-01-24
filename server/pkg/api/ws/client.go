package ws

import (
	"fmt"
	"log"

	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
)

type client struct {
	ID      string
	Manager *Manager
	Conn    *websocket.Conn
	Rooms   map[string]*room
	logger  *log.Logger
}

func NewClient(conn *websocket.Conn, m *Manager) (*client, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	c := &client{
		ID:      id.String(),
		Manager: m,
		Conn:    conn,
		Rooms:   make(map[string]*room),
	}
	c.logger = log.New(log.Writer(), "[Client "+c.ID+"] ", log.LstdFlags)

	return c, nil
}

func (c *client) read() {
	for {
		p := &Packet{}
		err := c.Conn.ReadJSON(p)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				// log.Println("read error:", err)
				c.logger.Println("read error:", err)
				return
			}
			continue
		}

		c.logger.Println("got packet:", p)
		c.handlePacket(p)
	}
}

func (c *client) handlePacket(p *Packet) error {
	switch p.Action {
	case ActionNoAction:
		c.logger.Println("no action:", p)
	case ActionMessage:
		c.Manager.broadcast(ActionNoAction, p, c.ID)
	case ActionJoinRoom:
		err := c.joinRoom(p.RoomID)
		if err != nil {
			return fmt.Errorf("%s ActionJoinRoom: %w", c.logger.Prefix(), err)
		}
	case ActionLeaveRoom:
		if err := c.leaveRoom(p.RoomID); err != nil {
			return fmt.Errorf("%s ActionLeaveRoom: %w", c.logger.Prefix(), err)
		}
	}

	return nil
}

func (c *client) sendPacket(p *Packet) error {
	if err := c.Conn.WriteJSON(p); err != nil {
		return fmt.Errorf("%s - sendPacket: %w", c.logger.Prefix(), err)
	}
	return nil
}

func (c *client) joinRoom(rID string) error {
	r, err := c.Manager.getRoom(rID)
	if err != nil {
		return fmt.Errorf("%s joinRoom: %w", c.logger.Prefix(), err)
	}

	r.addClient(c.ID)

	return nil
}

func (c *client) leaveRoom(rID string) error {
	r, err := c.Manager.getRoom(rID)
	if err != nil {
		return fmt.Errorf("%s leaveRoom: %w", c.logger.Prefix(), err)
	}

	if err = r.removeClient(c.ID); err != nil {
		return fmt.Errorf("%s leaveRoom: %w", c.logger.Prefix(), err)
	}

	return nil
}
