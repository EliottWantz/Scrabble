package ws

import (
	"fmt"
	"log"
	"sync"

	"scrabble/internal/uuid"

	"github.com/gofiber/websocket/v2"
)

type client struct {
	id      uuid.UUID
	manager *Manager
	conn    *websocket.Conn
	operator
	mu sync.Mutex
}

func NewClient(conn *websocket.Conn, m *Manager) *client {
	return &client{
		id:       uuid.New(),
		conn:     conn,
		manager:  m,
		operator: newOperator(),
	}
}

func (c *client) read() {
	for {
		log.Println("waiting for packet")
		p := &packet{}
		err := c.conn.ReadJSON(p)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Println("read error:", err)
				return
			}
			continue
		}

		log.Println("got packet:", p)
		c.queueOp(func() error { return c.handlePacket(p) })
	}
}

func (c *client) handlePacket(p *packet) error {
	switch p.Action {
	case ActionNoAction:
		return nil
	case ActionJoinRoom:
		err := c.joinRoom(p.RoomID)
		if err != nil {
			return err
		}
	case ActionBroadCast:
		r, ok := c.manager.rooms[p.RoomID]
		if !ok {
			return fmt.Errorf("%w: no room found with id %s", ErrInvalidUUID, p.RoomID)
		}

		return c.to(r).emit(ActionNoAction, p.Data)
	}
	return nil
}

func (c *client) sendPacket(p *packet) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if err := c.conn.WriteJSON(p); err != nil {
		return fmt.Errorf("write error: %w", err)
	}
	return nil
}

func (c *client) to(r *room) *broadCaster {
	return &broadCaster{
		room: r,
		from: c.id,
	}
}

func (c *client) joinRoom(rID uuid.UUID) error {
	r, ok := c.manager.rooms[rID]
	if !ok {
		return fmt.Errorf("%w: no room found with id %s", ErrInvalidUUID, rID)
	}

	r.queueOp(func() error { return r.addClient(c) })

	return nil
}
