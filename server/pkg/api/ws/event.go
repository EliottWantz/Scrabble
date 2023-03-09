package ws

// Client events
var (
	ClientEventNoEvent     = ""
	ClientEventChatMessage = "chat-message"
	ClientEventJoinRoom    = "join-room"
	ClientEventJoinDMRoom  = "join-dm-room"
	ClientEventCreateRoom  = "create-room"
	ClientEventLeaveRoom   = "leave-room"
	ClientEventPlayMove    = "playMove"
)

// Server events
var (
	ServerEventJoinedRoom           = "joinedRoom"
	ServerEventLeftRoom             = "leftRoom"
	ServerEventUserJoined           = "userJoined"
	ServerEventListUsers            = "listUsers"
	ServerEventUsersInRoom          = "usersInRoom"
	ServerEventGameUpdate           = "gameUpdate"
	ServerEventGameOver             = "gameOver"
	ServerEventFriendRequest        = "friendRequest"
	ServerEventAcceptFriendRequest  = "acceptFriendRequest"
	ServerEventDeclineFriendRequest = "declineFriendRequest"

	ServerEventError = "error"
)
