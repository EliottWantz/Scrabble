package ws

import (
	"errors"
	"fmt"
	"log"

	"scrabble/internal/uuid"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
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

			r := m.createRoom()
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
			p := &Packet{}
			err := conn.ReadJSON(p)
			if err != nil {
				log.Println(err)
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Println("read error:", err)
				}
				return
			}

			log.Println("got packet:", p)
			if c, ok := m.clients[conn]; ok {
				err := m.handlePacket(c, p)
				log.Println(err)
			}
		}
	})
}

func (m *WebSocketManager) handlePacket(c *client, p *Packet) error {
	switch p.Action {
	case 0:
		return nil
	case ActionJoinRoom:
		err := m.joinRoom(c, p.RoomID)
		if err != nil {
			return err
		}
	}
	return nil
}

func (m *WebSocketManager) createRoom() *Room {
	r := NewRoom()
	m.rooms[r.id] = r

	return r
}

func (m *WebSocketManager) joinRoom(c *client, rID uuid.UUID) error {
	log.Println("id =", rID)
	r, ok := m.rooms[rID]
	if !ok {
		return fmt.Errorf("%w: %s", ErrNoRoomWithUUID, rID.String())
	}

	log.Println("room:", r)

	r.register <- c
	log.Println("client should be in room")

	return nil
}
