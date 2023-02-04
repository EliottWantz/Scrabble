package ws

type packet struct {
	Action    string `json:"action,omitempty"`
	RoomID    string `json:"roomId,omitempty"`
	Timestamp string `json:"timestamp,omitempty"`
	Data      any    `json:"data,omitempty"`
}
