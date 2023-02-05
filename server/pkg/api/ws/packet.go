package ws

type packet struct {
	Action    string `json:"action,omitempty"`
	RoomID    string `json:"roomId,omitempty"`
	From      string `json:"from,omitempty"`
	Timestamp string `json:"timestamp,omitempty"`
	Data      any    `json:"data,omitempty"`
}
