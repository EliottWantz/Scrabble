package ws

// Client events
var (
	ClientEventNoEvent        = ""
	ClientEventChatMessage    = "chat-message"
	ClientEventJoinRoom       = "join-room"
	ClientEventJoinDMRoom     = "join-dm-room"
	ClientEventJoinGameRoom   = "join-game-room"
	ClientEventCreateRoom     = "create-room"
	ClientEventCreateGameRoom = "create-game-room"
	ClientEventLeaveRoom      = "leave-room"
	ClientEventStartGame      = "start-game"
	ClientEventPlayMove       = "playMove"
	ClientEventIndice         = "indice"
)

// Server events
var (
	ServerEventJoinedRoom           = "joinedRoom"
	ServerEventLeftRoom             = "leftRoom"
	ServerEventUserJoined           = "userJoined"
	ServerEventListUsers            = "listUsers"
	ServerEventNewUser              = "newUser"
	ServerEventListChatRooms        = "listChatRooms"
	ServerEventJoinableGames        = "joinableGames"
	ServerEventGameUpdate           = "gameUpdate"
	ServerEventTimerUpdate          = "timerUpdate"
	ServerEventGameOver             = "gameOver"
	ServerEventFriendRequest        = "friendRequest"
	ServerEventAcceptFriendRequest  = "acceptFriendRequest"
	ServerEventDeclineFriendRequest = "declineFriendRequest"
	ServerEventIndice               = "indice"

	ServerEventError = "error"
)
