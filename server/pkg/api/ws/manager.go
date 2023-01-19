package ws

import (
	"errors"
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
)

var (
	ErrInvalidUUID = errors.New("uuid is invalid")
	ErrNilUUID     = errors.New("uuid is nil")

	ErrNoRoomWithUUID = errors.New("no room found with given uuid")
)

type WebSocketManager struct {
	clients    map[*websocket.Conn]*client
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	rooms      map[uuid.UUID]*Room
}

func NewWebSocketManager() *WebSocketManager {
	m := &WebSocketManager{
		clients:    make(map[*websocket.Conn]*client),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
		rooms:      make(map[uuid.UUID]*Room),
	}

	go m.run()

	return m
}

func (m *WebSocketManager) run() {
	for {
		select {
		case conn := <-m.register:
			c := NewClient(conn)
			m.clients[conn] = c

			r := NewRoom()
			r.register <- c
			log.Println("connection registered:", conn.RemoteAddr())

		case conn := <-m.unregister:
			c, ok := m.clients[conn]
			if !ok {
				continue
			}

			for _, room := range m.rooms {
				room.unregister <- c
			}

			delete(m.clients, conn)
			log.Println("connection unregistered")
		}
	}
}

func (m *WebSocketManager) HandleConn() fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		defer func() {
			m.unregister <- conn
			conn.Close()
		}()

		m.register <- conn

		for {
			log.Println("waiting for packet")
			var p Packet
			err := conn.ReadJSON(&p)
			if err != nil {
				log.Println(err)
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Println("read error:", err)
				}
				return
			}

			log.Println("got packet:", p)
			if c, ok := m.clients[conn]; ok {
				m.handlePacket(c, &p)
			}
		}
	})
}

func (m *WebSocketManager) handlePacket(c *client, p *Packet) {
	switch p.Action {
	case 0:
		return
	case ActionJoinRoom:
		m.joinRoom(c, uuid.UUID{})
	}
}

func (m *WebSocketManager) createRoom() *Room {
	r := NewRoom()
	m.rooms[r.id] = r

	return r
}

func (m *WebSocketManager) joinRoom(c *client, rID uuid.UUID) error {
	var (
		r  *Room
		ok bool
	)

	if rID == uuid.Nil {
		log.Println("No id")
		r = m.createRoom()
		rID = r.id
	}

	log.Println("id =", rID)
	if r == nil {
		r, ok = m.rooms[rID]
		if !ok {
			return fmt.Errorf("%w: %s", ErrNoRoomWithUUID, rID.String())
		}
	}

	log.Println("room:", r)

	r.register <- c
	log.Println("client should be in room")

	return nil
}
