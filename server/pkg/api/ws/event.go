package ws

// Client events
var (
	ClientEventNoEvent     = ""
	ClientEventChatMessage = "chat-message"
	ClientEventPlayMove    = "playMove"
)

// Server events
var (
	ServerEventJoinedRoom  = "joinedRoom"
	ServerEventUserJoined  = "userJoined"
	ServerEventListUsers   = "listUsers"
	ServerEventUsersInRoom = "usersInRoom"
	ServerEventGameUpdate  = "gameUpdate"
)
