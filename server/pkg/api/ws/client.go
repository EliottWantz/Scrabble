package ws

import (
	"errors"
	"os"

	"github.com/alphadose/haxmap"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
	"golang.org/x/exp/slog"
)

var ErrLeavingOwnRoom = errors.New("trying to leave own room")

type client struct {
	ID      string
	Manager *Manager
	Conn    *websocket.Conn
	Rooms   *haxmap.Map[string, *room]
	logger  *slog.Logger
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
	c.logger = slog.New(slog.NewTextHandler(os.Stdout)).With("client", c.ID)

	return c, nil
}

func (c *client) receive() (*Packet, error) {
	p := &Packet{}
	err := c.Conn.ReadJSON(p)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func (c *client) send(p *Packet) error {
	if err := c.Conn.WriteJSON(p); err != nil {
		return err
	}
	return nil
}

func (c *client) handlePacket(p *Packet) error {
	switch p.Action {
	case "":
		c.logger.Info("received packet with no action")
	case "broadcast":
		return c.Manager.broadcast(p, c.ID)
	case "join":
		return c.joinRoom(p.RoomID)
	case "leave":
		return errors.New("not implemented")
		// return c.leaveRoom(p.RoomID)
	}

	return nil
}

func (c *client) joinRoom(rID string) error {
	r, err := c.Manager.getRoom(rID)
	if err != nil {
		return err
	}

	if err := r.addClient(c.ID); err != nil {
		return err
	}

	return nil
}

func (c *client) leaveRoom(rID string) error {
	if rID == c.ID {
		return ErrLeavingOwnRoom
	}
	r, err := c.Manager.getRoom(rID)
	if err != nil {
		return err
	}

	if err = r.removeClient(c.ID); err != nil {
		return err
	}

	return nil
}
