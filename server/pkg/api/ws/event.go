package ws

// Client events
var (
	ClientEventNoEvent   = ""
	ClientEventJoin      = "join"
	ClientEventLeave     = "leave"
	ClientEventBroadcast = "broadcast"
)

// Server events
var (
	ServerEventJoinedRoom = "joinedRoom"
	// ServerEventUsersInRoom = "usersInRoom"
)
