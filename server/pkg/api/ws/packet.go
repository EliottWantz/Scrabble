package ws

type Packet struct {
	Action string `json:"action,omitempty"`
	RoomID string `json:"roomId,omitempty"`
	Data   any    `json:"data,omitempty"`
}
