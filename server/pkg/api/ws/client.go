package ws

import (
	"sync"

	"github.com/gofiber/websocket/v2"
)

type client struct {
	conn      *websocket.Conn
	isClosing bool
	mu        sync.Mutex
}

func NewClient(conn *websocket.Conn) *client {
	return &client{
		conn: conn,
	}
}