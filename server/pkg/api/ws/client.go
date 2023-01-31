package ws

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"

	"github.com/alphadose/haxmap"
	"github.com/gofiber/websocket/v2"
	"golang.org/x/exp/slog"
)

var ErrLeavingOwnRoom = errors.New("trying to leave own room")

type client struct {
	ID        string
	Manager   *Manager
	Conn      *websocket.Conn
	Rooms     *haxmap.Map[string, *room]
	logger    *slog.Logger
	sendCh    chan *Packet
	receiveCh chan *Packet
}

func NewClient(conn *websocket.Conn, cID string, m *Manager) *client {
	c := &client{
		ID:        cID,
		Manager:   m,
		Conn:      conn,
		Rooms:     haxmap.New[string, *room](),
		sendCh:    make(chan *Packet, 10),
		receiveCh: make(chan *Packet, 10),
	}
	c.logger = slog.With("client", c.ID)

	return c
}

func (c *client) write() {
	for p := range c.sendCh {
		if err := c.Conn.WriteJSON(p); err != nil {
			c.logger.Error("write packet", err)
		}
	}
}

func (c *client) send(p *Packet) {
	c.sendCh <- p
}

func (c *client) read() {
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
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure, websocket.CloseNoStatusReceived) {
				c.logger.Error("client read packet", err)
				return
			}

			c.logger.Info("client disconnected")
			return
		}

		c.receiveCh <- p
	}
}

// CloseError represents a close message.
type CloseError struct {
	// Code is defined in RFC 6455, section 11.7.
	Code int

	// Text is the optional text payload.
	Text string
}

// Close codes defined in RFC 6455, section 11.7.
const (
	CloseNormalClosure           = 1000
	CloseGoingAway               = 1001
	CloseProtocolError           = 1002
	CloseUnsupportedData         = 1003
	CloseNoStatusReceived        = 1005
	CloseAbnormalClosure         = 1006
	CloseInvalidFramePayloadData = 1007
	ClosePolicyViolation         = 1008
	CloseMessageTooBig           = 1009
	CloseMandatoryExtension      = 1010
	CloseInternalServerErr       = 1011
	CloseServiceRestart          = 1012
	CloseTryAgainLater           = 1013
	CloseTLSHandshake            = 1015
)

func (e *CloseError) Error() string {
	s := []byte("websocket: close ")
	s = strconv.AppendInt(s, int64(e.Code), 10)
	switch e.Code {
	case CloseNormalClosure:
		s = append(s, " (normal)"...)
	case CloseGoingAway:
		s = append(s, " (going away)"...)
	case CloseProtocolError:
		s = append(s, " (protocol error)"...)
	case CloseUnsupportedData:
		s = append(s, " (unsupported data)"...)
	case CloseNoStatusReceived:
		s = append(s, " (no status)"...)
	case CloseAbnormalClosure:
		s = append(s, " (abnormal closure)"...)
	case CloseInvalidFramePayloadData:
		s = append(s, " (invalid payload data)"...)
	case ClosePolicyViolation:
		s = append(s, " (policy violation)"...)
	case CloseMessageTooBig:
		s = append(s, " (message too big)"...)
	case CloseMandatoryExtension:
		s = append(s, " (mandatory extension missing)"...)
	case CloseInternalServerErr:
		s = append(s, " (internal server error)"...)
	case CloseTLSHandshake:
		s = append(s, " (TLS handshake error)"...)
	}
	if e.Text != "" {
		s = append(s, ": "...)
		s = append(s, e.Text...)
	}
	return string(s)
}

func IsUnexpectedCloseError(err error, expectedCodes ...int) bool {
	if e, ok := err.(*CloseError); ok {
		for _, code := range expectedCodes {
			if e.Code == code {
				return false
			}
		}
		return true
	}
	return false
}

func (c *client) receive() {
	for p := range c.receiveCh {
		c.logger.Info("received packet", "packet", p)
		if err := c.handlePacket(p); err != nil {
			c.logger.Error("handlePacket", err)
		}
	}
}

func (c *client) handlePacket(p *Packet) error {
	switch p.Action {
	case "":
		c.logger.Info("received packet with no action")
	case "broadcast":
		return c.broadcast(p)
	case "join":
		return c.joinRoom(p.RoomID)
	case "leave":
		return c.leaveRoom(p.RoomID)
	}

	return nil
}

func (c *client) broadcast(p *Packet) error {
	r, err := c.Manager.getRoom(p.RoomID)
	if err != nil {
		return fmt.Errorf("broadcast: %w", err)
	}

	if !r.has(c.ID) {
		return fmt.Errorf("%w %s", ErrNotInRoom, p.RoomID)
	}

	r.broadcast(p, c.ID)

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
