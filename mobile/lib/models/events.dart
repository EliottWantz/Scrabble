// Server events
const String ServerEventJoinedRoom = "joinedRoom";
// const String ServerEventUserJoined = "userJoined";
const String ServerEventUserJoinedRoom = "userJoinedRoom";
const String ServerEventJoinedDMRoom = "joinedDMRoom";
const String ServerEventLeftDMRoom = "leftDMRoom";
const String ServerEventUserJoinedDMRoom = "userJoinedDMRoom";
const String ServerEventUserLeftDMRoom = "userLeftDMRoom";
const String ServerEventListUsers    = "listUsers";
const String ServerEventNewUser = "newUser";
const String ServerEventUsersInRoom  = "usersInRoom";
const String ServerEventChatMessage = "chat-message";
const String ServerEventJoinableGames = "joinableGames";
const String ServerEventObservableGames = "observableGames";
const String ServerEventJoinedGame           = "joinedGame";
const String ServerEventJoinedGameAsObserver = "joinedGameAsObserver";
const String ServerEventLeftGame = "leftGame";
const String ServerEventUserJoinedGame       = "userJoinedGame";
const String ServerEventGameUpdate = "gameUpdate";
const String ServerEventTimerUpdate = "timerUpdate";
const String ServerEventGameOver = "gameOver";

const String ServerEventFriendRequest = "friendRequest";
const String ServerEventAcceptFriendRequest = "acceptFriendRequest";
const String ServerEventDeclineFriendRequest = "declineFriendRequest";

const String ServerEventUserRequestToJoinGame = "userRequestToJoinGame";
const String ServerEventRevokeRequestToJoinGame = "revokeRequestToJoinGame";
const String ServerEventUserRequestToJoinGameAccepted = "userRequestToJoinGameAccepted";
const String ServerEventUserRequestToJoinGameDeclined = "userRequestToJoinGameDeclined";

const String ServerEventIndice = "indice";

const String ServerEventError   = "error";


// Client events
const String ClientEventNoEvent     = "";
const String ClientEventChatMessage = "chat-message";
const String ClientEventJoinAsObservateur  = "join-game-as-observateur";
const String ClientEventLeaveAsObservateur = "leave-game-as-observateur";
const String ClientEventJoinRoom    = "join-room";
// const String ClientEventJoinGameRoom = "join-game-room";
const String ClientEventCreateRoom  = "create-room";
const String ClientEventCreateDMRoom = "create-dm-room";
// const String ClientEventCreateGameRoom = "create-game-room";
const String ClientEventLeaveRoom   = "leave-room";
const String ClientEventListRooms = "list-rooms";
const String ClientEventListJoinableGames = "list-joinable-games";
const String ClientEventCreateGame = "create-game";
const String ClientEventJoinGame = "join-game";
const String ClientEventLeaveGame = "leave-game";
const String ClientEventStartGame = "start-game";
const String ClientEventPlayMove    = "playMove";
const String ClientEventIndice = "indice";


// Error payloads
const String JoinGamePasswordMismatch = "password mismatch";
const String JoinGamePasswordMismatchMessage = "Mauvais mot de passe";

