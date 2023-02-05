package ws

type packet struct {
	Event     string `json:"event,omitempty"`
	RoomID    string `json:"roomId,omitempty"`
	From      string `json:"from,omitempty"`
	Timestamp string `json:"timestamp,omitempty"`
	Data      any    `json:"data,omitempty"`
}

const (
	EventNoEvent   = ""
	EventJoin      = "join"
	EventLeave     = "leave"
	EventBroadcast = "broadcast"
)
