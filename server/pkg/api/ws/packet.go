package ws

type Action int

const (
	ActionNoAction Action = iota
	ActionMessage
	ActionJoinRoom
	ActionLeaveRoom
)

type Packet struct {
	Action Action `json:"action,omitempty"`
	RoomID string `json:"roomId,omitempty"`
	Data   any    `json:"data,omitempty"`
}
