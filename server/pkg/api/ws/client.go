package ws

import (
	"fmt"
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
)

type client struct {
	manager   *Manager
	conn      *websocket.Conn
	isClosing bool
	mu        sync.Mutex
}

func NewClient(conn *websocket.Conn, m *Manager) *client {
	return &client{
		conn:    conn,
		manager: m,
	}
}

func (c *client) run() {
	for {
		log.Println("waiting for packet")
		p := &Packet{}
		err := c.conn.ReadJSON(p)
		if err != nil {
			log.Println(err)
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Println("read error:", err)
			}
			return
		}

		log.Println("got packet:", p)
		err = c.handlePacket(p)
		log.Println(err)
	}
}

func (c *client) handlePacket(p *Packet) error {
	switch p.Action {
	case 0:
		return nil
	case ActionJoinRoom:
		err := c.manager.joinRoom(c, p.RoomID)
		if err != nil {
			return err
		}
	case ActionBroadCast:
		r, ok := c.manager.rooms[p.RoomID]
		if !ok {
			return fmt.Errorf("%w: no room found with id %s", ErrInvalidUUID, p.RoomID)
		}

		r.do(func() {
			r.broadcast(p)
		})
	}
	return nil
}
