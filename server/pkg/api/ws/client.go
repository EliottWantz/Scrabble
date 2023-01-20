package ws

import (
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
)

type client struct {
	conn      *websocket.Conn
	isClosing bool
	mu        sync.Mutex
	manager   *Manager
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
	}
	return nil
}
