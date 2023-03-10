package ws

// Client events
var (
	ClientEventNoEvent           = ""
	ClientEventChatMessage       = "chat-message"
	ClientEventJoinRoom          = "join-room"
	ClientEventJoinDMRoom        = "join-dm-room"
	ClientEventCreateRoom        = "create-room"
	ClientEventCreateGameRoom    = "create-game-room"
	ClientEventLeaveRoom         = "leave-room"
	ClientEventListRooms         = "list-rooms"
	ClientEventListJoinableGames = "list-joinable-games"
	ClientEventStartGame         = "start-game"
	ClientEventPlayMove          = "playMove"
)

// Server events
var (
	ServerEventJoinedRoom           = "joinedRoom"
	ServerEventLeftRoom             = "leftRoom"
	ServerEventUserJoined           = "userJoined"
	ServerEventListUsers            = "listUsers"
	ServerEventNewUser              = "newUser"
	ServerEventListRooms            = "listRooms"
	ServerEventUsersInRoom          = "usersInRoom"
	ServerEventJoinableGames        = "joinableGames"
	ServerEventGameUpdate           = "gameUpdate"
	ServerEventGameOver             = "gameOver"
	ServerEventFriendRequest        = "friendRequest"
	ServerEventAcceptFriendRequest  = "acceptFriendRequest"
	ServerEventDeclineFriendRequest = "declineFriendRequest"

	ServerEventError = "error"
)
