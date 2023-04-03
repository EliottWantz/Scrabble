package ws

// Client events
var (
	ClientEventNoEvent     = ""
	ClientEventChatMessage = "chat-message"

	ClientEventGamePrivate = "game-private"
	ClientEventGamePublic  = "game-public"

	ClientEventReplaceBotByObserver = "replace-bot-by-observer"

	ClientEventCreateRoom = "create-room"
	ClientEventJoinRoom   = "join-room"
	ClientEventLeaveRoom  = "leave-room"

	ClientEventCreateDMRoom = "create-dm-room"
	ClientEventLeaveDMRoom  = "leave-dm-room"

	ClientEventCreateGame             = "create-game"
	ClientEventJoinGame               = "join-game"
	ClientEventLeaveGame              = "leave-game"
	ClientEventStartGame              = "start-game"
	ClientEventJoinGameAsObservateur  = "join-game-as-observateur"
	ClientEventLeaveGameAsObservateur = "leave-game-as-observateur"

	ClientEventPlayMove = "playMove"
	ClientEventIndice   = "indice"

	ClientEventCreateTournament             = "create-tournament"
	ClientEventJoinTournament               = "join-tournament"
	ClientEventLeaveTournament              = "leave-tournament"
	ClientEventStartTournament              = "start-tournament"
	ClientEventJoinTournamentAsObservateur  = "join-tournament-as-observateur"
	ClientEventLeaveTournamentAsObservateur = "leave-tournament-as-observateur"
)

// Server events
var (
	ServerEventJoinedRoom     = "joinedRoom"
	ServerEventLeftRoom       = "leftRoom"
	ServerEventUserJoinedRoom = "userJoinedRoom"
	ServerEventUserLeftRoom   = "userLeftRoom"

	ServerEventJoinedDMRoom     = "joinedDMRoom"
	ServerEventLeftDMRoom       = "leftDMRoom"
	ServerEventUserJoinedDMRoom = "userJoinedDMRoom"
	ServerEventUserLeftDMRoom   = "userLeftDMRoom"

	ServerEventListUsers             = "listUsers"
	ServerEventListOnlineUsers       = "listOnlineUsers"
	ServerEventNewUser               = "newUser"
	ServerEventListChatRooms         = "listChatRooms"
	ServerEventJoinableGames         = "joinableGames"
	ServerEventJoinableTournaments   = "joinableTournaments"
	ServerEventObservableGames       = "observableGames"
	ServerEventObservableTournaments = "observableTournaments"

	ServerEventJoinedGame           = "joinedGame"
	ServerEventJoinedGameAsObserver = "joinedGameAsObserver"
	ServerEventLeftGame             = "leftGame"
	ServerEventUserJoinedGame       = "userJoinedGame"
	ServerEventUserLeftGame         = "userLeftGame"
	ServerEventGameUpdate           = "gameUpdate"
	ServerEventTimerUpdate          = "timerUpdate"
	ServerEventGameOver             = "gameOver"
	ServerEventIndice               = "indice"

	ServerEventFriendRequest        = "friendRequest"
	ServerEventAcceptFriendRequest  = "acceptFriendRequest"
	ServerEventDeclineFriendRequest = "declineFriendRequest"

	ServerEventJoinedTournament     = "joinedTournament"
	ServerEventLeftTournament       = "leftTournament"
	ServerEventUserJoinedTournament = "userJoinedTournament"
	ServerEventUserLeftTournament   = "userLeftTournament"
	ServerEventTournamentUpdate     = "tournamentUpdate"
	ServerEventTournamentOver       = "tournamentOver"

	ServerEventUserRequestToJoinGame               = "userRequestToJoinGame"
	ServerEventUserRequestToJoinTournament         = "userRequestToJoinTournament"
	ServerEventUserRequestToJoinGameAccepted       = "userRequestToJoinGameAccepted"
	ServerEventUserRequestToJoinTournamentAccepted = "userRequestToJoinTournamentAccepted"
	ServerEventUserRequestToJoinGameDeclined       = "userRequestToJoinGameDeclined"
	ServerEventUserRequestToJoinTournamentDeclined = "userRequestToJoinTournamentDeclined"

	ServerEventError = "error"
)
