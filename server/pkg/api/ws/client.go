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

var (
	ErrLeavingOwnRoom     = errors.New("trying to leave own room")
	ErrLeavingGloabalRoom = errors.New("client trying to leave global room")
)

type Client struct {
	ID        string
	Manager   *Manager
	Conn      *websocket.Conn
	Rooms     *haxmap.Map[string, *Room]
	logger    *slog.Logger
	sendCh    chan *Packet
	receiveCh chan *Packet
	quitCh    chan struct{}
}

func NewClient(conn *websocket.Conn, cID string, m *Manager) *Client {
	c := &Client{
		ID:        cID,
		Manager:   m,
		Conn:      conn,
		Rooms:     haxmap.New[string, *Room](),
		logger:    slog.With("client", cID),
		sendCh:    make(chan *Packet, 10),
		receiveCh: make(chan *Packet, 10),
		quitCh:    make(chan struct{}),
	}

	go c.write()
	go c.read()

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
				c.logger.Info("json syntax error in packet", syntaxError)
				continue
			}
			c.quitCh <- struct{}{}
			return
		}

		c.receiveCh <- p
	}
}

func (c *Client) receive() {
	for p := range c.receiveCh {
		c.logger.Info("received packet", "event", p.Event)
		if err := c.handlePacket(p); err != nil {
			c.logger.Error("handlePacket", err)
		}
	}
}

func (c *Client) handlePacket(p *Packet) error {
	switch p.Event {
	case ClientEventNoEvent:
		c.logger.Info("received packet with no action")
	case ClientEventBroadcast:
		return c.broadcast(p)
	}

	return nil
}

func (c *Client) broadcast(p *Packet) error {
	payload := ChatMessage{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return fmt.Errorf("failed to unmarshal BroadcastPayload: %w", err)
	}
	slog.Info("broadcast", "payload", payload)

	r, err := c.Manager.GetRoom(payload.RoomID)
	if err != nil {
		return fmt.Errorf("broadcast: %w", err)
	}

	if !r.has(c.ID) {
		return fmt.Errorf("%w %s", ErrNotInRoom, payload.RoomID)
	}

	payload.Timestamp = time.Now().UTC()

	if err := r.Manager.MessageRepo.InsertOne(r.ID, &payload); err != nil {
		// return fmt.Errorf("failed to insert message in db: %w", err)
		slog.Error("failed to insert message in db", err)
	}

	if err := p.setPayload(payload); err != nil {
		return err
	}
	r.Broadcast(p)

	return nil
}
