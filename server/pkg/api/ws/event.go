package ws

// Client events
var (
	ClientEventNoEvent     = ""
	ClientEventChatMessage = "chat-message"
	ClientEventJoinRoom    = "join-room"
	ClientEventJoinDMRoom  = "join-dm-room"
	ClientEventCreateRoom  = "create-room"
	ClientEventLeaveRoom   = "leave-room"
)

// Server events
var (
	ServerEventJoinedRoom  = "joinedRoom"
	ServerEventUserJoined  = "userJoined"
	ServerEventListUsers   = "listUsers"
	ServerEventUsersInRoom = "usersInRoom"

	ServerEventError = "error"
)
