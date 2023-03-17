package ws

// Client events
var (
	ClientEventNoEvent      = ""
	ClientEventChatMessage  = "chat-message"
	ClientEventCreateRoom   = "create-room"
	ClientEventJoinRoom     = "join-room"
	ClientEventLeaveRoom    = "leave-room"
	ClientEventCreateDMRoom = "create-dm-room"
	ClientEventCreateGame   = "create-game"
	ClientEventJoinGame     = "join-game"
	ClientEventLeaveGame    = "leave-game"
	ClientEventStartGame    = "start-game"
	ClientEventPlayMove     = "playMove"
	ClientEventIndice       = "indice"
)

// Server events
var (
	ServerEventJoinedRoom           = "joinedRoom"
	ServerEventLeftRoom             = "leftRoom"
	ServerEventUserJoinedRoom       = "userJoinedRoom"
	ServerEventUserLeftRoom         = "userLeftRoom"
	ServerEventListUsers            = "listUsers"
	ServerEventNewUser              = "newUser"
	ServerEventListChatRooms        = "listChatRooms"
	ServerEventJoinableGames        = "joinableGames"
	ServerEventJoinedGame           = "joinedGame"
	ServerEventUserJoinedGame       = "userJoinedGame"
	ServerEventLeftGame             = "leftGame"
	ServerEventUserLeftGame         = "userLeftGame"
	ServerEventGameUpdate           = "gameUpdate"
	ServerEventTimerUpdate          = "timerUpdate"
	ServerEventGameOver             = "gameOver"
	ServerEventFriendRequest        = "friendRequest"
	ServerEventAcceptFriendRequest  = "acceptFriendRequest"
	ServerEventDeclineFriendRequest = "declineFriendRequest"
	ServerEventIndice               = "indice"

	ServerEventError = "error"
)
