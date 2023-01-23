package ws

import (
	"fmt"
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
)

type client struct {
	ID       string
	Manager  *Manager
	Conn     *websocket.Conn
	Rooms    map[string]*room
	Operator operator
	mu       sync.Mutex
}

func NewClient(conn *websocket.Conn, m *Manager) (*client, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	c := &client{
		ID:       id.String(),
		Manager:  m,
		Conn:     conn,
		Rooms:    map[string]*room{},
		Operator: newOperator(),
	}

	go c.Operator.run()

	return c, nil
}

func (c *client) read() {
	for {
		p := &packet{}
		err := c.Conn.ReadJSON(p)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Println("read error:", err)
				return
			}
			continue
		}

		log.Println("got packet:", p)
		c.handlePacket(p)
	}
}

func (c *client) handlePacket(p *packet) {
	c.Operator.queueOp(func() {
		switch p.Action {
		case ActionNoAction:
			log.Println("no action:", p)
		case ActionMessage:
			c.Manager.broadcast(ActionNoAction, p, c.ID)
		case ActionJoinRoom:
			err := c.joinRoom(p.RoomID)
			if err != nil {
				log.Println("ActionJoinRoom:", err)
			}
		case ActionLeaveRoom:
			err := c.leaveRoom(p.RoomID)
			log.Println("ActionLeaveRoom:", err)
		}
	})
}

func (c *client) sendPacket(p *packet) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if err := c.Conn.WriteJSON(p); err != nil {
		return fmt.Errorf("write error: %w", err)
	}
	return nil
}

func (c *client) joinRoom(rID string) error {
	r, err := c.Manager.getRoom(rID)
	if err != nil {
		return err
	}

	r.addClient(c.ID)

	return nil
}

func (c *client) leaveRoom(rID string) error {
	r, ok := c.Manager.Rooms[rID]
	if !ok {
		return fmt.Errorf("%w: no room found with id %s", ErrInvalidUUID, rID)
	}

	r.removeClient(c.ID)

	return nil
}
