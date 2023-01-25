package ws

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net"

	"github.com/alphadose/haxmap"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
)

type client struct {
	ID      string
	Manager *Manager
	Conn    *websocket.Conn
	Rooms   *haxmap.Map[string, *room]
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
		Rooms:   haxmap.New[string, *room](),
	}

	return c, nil
}

func (c *client) read() {
	for {
		p := &Packet{}
		err := c.Conn.ReadJSON(p)
		if err != nil {
			var syntaxError *json.SyntaxError
			if errors.As(err, &syntaxError) {
				log.Printf("websocket.UnexpectedCloseError: %T %+v", err, err)
				continue
			}
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("websocket.UnexpectedCloseError: %T %+v", err, err)
				return
			}
			if _, ok := err.(net.Error); ok {
				log.Printf("net.Error: %T %+v", err, err)
				return
			}
			log.Printf("Another error: %T %+v", err, err)
			return
		}

		log.Println("got packet:", p)
		if err := c.handlePacket(p); err != nil {
			log.Printf("handlePacket: %T %+v", err, err)
		}
	}
}

func (c *client) handlePacket(p *Packet) error {
	switch p.Action {
	case ActionNoAction:
		log.Println("no action:", p)
	case ActionMessage:
		if err := c.Manager.broadcast(ActionNoAction, p, c.ID); err != nil {
			return fmt.Errorf("%s ActionMessage: %w", log.Prefix(), err)
		}
	case ActionJoinRoom:
		if err := c.joinRoom(p.RoomID); err != nil {
			return fmt.Errorf("%s ActionJoinRoom: %w", log.Prefix(), err)
		}
	case ActionLeaveRoom:
		if err := c.leaveRoom(p.RoomID); err != nil {
			return fmt.Errorf("%s ActionLeaveRoom: %w", log.Prefix(), err)
		}
	}

	return nil
}

func (c *client) sendPacket(p *Packet) error {
	if err := c.Conn.WriteJSON(p); err != nil {
		return fmt.Errorf("%s - sendPacket: %w", log.Prefix(), err)
	}
	return nil
}

func (c *client) joinRoom(rID string) error {
	r, err := c.Manager.getRoom(rID)
	if err != nil {
		return fmt.Errorf("%s joinRoom: %w", log.Prefix(), err)
	}

	if err := r.addClient(c.ID); err != nil {
		return fmt.Errorf("%s joinRoom: %w", log.Prefix(), err)
	}

	return nil
}

func (c *client) leaveRoom(rID string) error {
	r, err := c.Manager.getRoom(rID)
	if err != nil {
		return fmt.Errorf("%s leaveRoom: %w", log.Prefix(), err)
	}

	if err = r.removeClient(c.ID); err != nil {
		return fmt.Errorf("%s leaveRoom: %w", log.Prefix(), err)
	}

	return nil
}
