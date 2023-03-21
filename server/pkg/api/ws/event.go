package ws

// Client events
var (
	ClientEventNoEvent            = ""
	ClientEventChatMessage        = "chat-message"
	ClientEventJoinAsObservateur  = "join-as-observateur"
	ClientEventLeaveAsObservateur = "leave-as-observateur"
	ClientEventGamePrivate        = "game-private"
	ClientEventGamePublic         = "game-public"
	ClientEventPutMeIn            = "put-me-in"
	ClientEventCreateRoom         = "create-room"
	ClientEventJoinRoom           = "join-room"
	ClientEventLeaveRoom          = "leave-room"
	ClientEventCreateDMRoom       = "create-dm-room"
	ClientEventLeaveDMRoom        = "leave-dm-room"
	ClientEventCreateGame         = "create-game"
	ClientEventJoinGame           = "join-game"
	ClientEventLeaveGame          = "leave-game"
	ClientEventStartGame          = "start-game"
	ClientEventPlayMove           = "playMove"
	ClientEventIndice             = "indice"
)

// Server events
var (
	ServerEventJoinedRoom           = "joinedRoom"
	ServerEventLeftRoom             = "leftRoom"
	ServerEventUserJoinedRoom       = "userJoinedRoom"
	ServerEventUserLeftRoom         = "userLeftRoom"
	ServerEventJoinedDMRoom         = "joinedDMRoom"
	ServerEventLeftDMRoom           = "leftDMRoom"
	ServerEventUserJoinedDMRoom     = "userJoinedDMRoom"
	ServerEventUserLeftDMRoom       = "userLeftDMRoom"
	ServerEventListUsers            = "listUsers"
	ServerEventNewUser              = "newUser"
	ServerEventListChatRooms        = "listChatRooms"
	ServerEventJoinableGames        = "joinableGames"
	ServerEventJoinedGame           = "joinedGame"
	ServerEventLeftGame             = "leftGame"
	ServerEventUserJoinedGame       = "userJoinedGame"
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
