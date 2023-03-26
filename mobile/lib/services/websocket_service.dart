import 'dart:async';
import 'dart:convert';

import 'package:client_leger/models/chat_message_payload.dart';
import 'package:client_leger/models/create_room_payload.dart';
import 'package:client_leger/models/events.dart';
import 'package:client_leger/models/join_dm_payload.dart';
import 'package:client_leger/models/join_room_payload.dart';
import 'package:client_leger/models/play_move_payload.dart';
import 'package:client_leger/models/requests/accept_friend_request.dart';
import 'package:client_leger/models/requests/chat_message_request.dart';
import 'package:client_leger/models/requests/create_dm_room_request.dart';
import 'package:client_leger/models/requests/create_game_room_request.dart';
import 'package:client_leger/models/requests/join_dm_request.dart';
import 'package:client_leger/models/requests/join_room_request.dart';
import 'package:client_leger/models/requests/play_move_request.dart';
import 'package:client_leger/models/response/accept_friend_response.dart';
import 'package:client_leger/models/response/chat_message_response.dart';
import 'package:client_leger/models/response/friend_request_response.dart';
import 'package:client_leger/models/response/game_update_response.dart';
import 'package:client_leger/models/response/joined_dm_room_response.dart';
import 'package:client_leger/models/response/joined_game_response.dart';
import 'package:client_leger/models/response/joined_room_response.dart';
import 'package:client_leger/models/response/list_users_response.dart';
import 'package:client_leger/models/response/send_friend_response.dart';
import 'package:client_leger/models/response/timer_response.dart';
import 'package:client_leger/models/response/user_joined_game_response.dart';
import 'package:client_leger/models/response/user_joined_response.dart';
import 'package:client_leger/models/response/user_joined_room_response.dart';
import 'package:client_leger/models/start_game_payload.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/room_service.dart';
import 'package:client_leger/services/users_service.dart';
import 'package:get/get.dart';
// import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:client_leger/api/api_constants.dart';
import 'package:get_storage/get_storage.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:client_leger/services/user_service.dart';

import '../models/create_dm_room_payload.dart';
import '../models/create_game_room_payload.dart';
import '../models/move_info.dart';
import '../models/requests/create_room_request.dart';
import '../models/requests/list_joinable_games_request.dart';
import '../models/requests/start_game_request.dart';
import '../models/response/list_joinable_games_response.dart';
import '../models/response/new_user_response.dart';
import '../models/response/user_joined_dm_room_response.dart';
import '../models/room.dart';
import 'game_service.dart';

class WebsocketService extends GetxService {
  final UserService userService;
  final UsersService usersService;
  final RoomService roomService;
  final GameService gameService = Get.find();

  WebsocketService(
      {required this.userService,
        required this.usersService,
      required this.roomService
      });

  late WebSocketChannel socket;
  late String roomId;
  late RxList<ChatMessageResponse> messages = <ChatMessageResponse>[].obs;
  late RxString timestamp = ''.obs;
  late RxInt itemCount = 0.obs;

  void connect() {
    socket = WebSocketChannel.connect(Uri(
        scheme: ApiConstants.wsScheme,
        host: ApiConstants.wsHost,
        port: ApiConstants.wsPort,
        path: ApiConstants.wsPath,
        queryParameters: { 'id': userService.user.value!.id, 'username': userService.user.value!.username }
    ));
    socket.stream.listen((data) {
      handleData(data);
          // print(data);
          // if (jsonDecode(data)['event'] == 'broadcast') {
          //   handleData(ChatMessageResponse.fromRawJson(data));
          // }
        },
      onError: (error) => print(error),
    );
  }

  // handleData(ChatMessageResponse data) {
    void handleData(dynamic data) {
    // print(data.payload!.message);
      print(jsonDecode(data)['event']);
    switch(jsonDecode(data)['event']) {
      case ServerEventListUsers: {
        ListUsersResponse listUsersResponse = ListUsersResponse.fromRawJson(data);
        handleEventListUsers(listUsersResponse);
      }
      break;
      case ServerEventNewUser: {
        NewUserResponse newUserResponse = NewUserResponse.fromRawJson(data);
        handleEventNewUser(newUserResponse);
      }
      break;
      case ServerEventJoinedDMRoom: {
        JoinedDMRoomResponse joinedDMRoomResponse = JoinedDMRoomResponse.fromRawJson(data);
        handleEventJoinedDMRoom(joinedDMRoomResponse);
      }
      break;
      case ServerEventUserJoinedDMRoom: {
        UserJoinedDMRoomResponse userJoinedDMRoomResponse = UserJoinedDMRoomResponse.fromRawJson(data);
        handleEventUserJoinedDMRoom(userJoinedDMRoomResponse);
      }
      break;
      break;
      case ServerEventJoinedRoom: {
        print('event joinedRoom');
        JoinedRoomResponse joinedRoomResponse = JoinedRoomResponse.fromRawJson(data);
        // joinedRoomResponse.payload.users.forEach(
        //         (user) => print(user.username)
        // );
        // print(joinedRoomResponse.payload.users);
        print('joined room response above');
        print(jsonDecode(data)['payload']['roomId']);
        handleEventJoinedRoom(joinedRoomResponse);
        // roomId = jsonDecode(data)['payload']['roomId'];
        // print(roomId);
      }
      break;
      case ServerEventUserJoinedRoom: {
        UserJoinedRoomResponse userJoinedRoomResponse = UserJoinedRoomResponse.fromRawJson(data);
        handleEventUserJoinedRoom(userJoinedRoomResponse);
      }
      break;
      case ServerEventJoinedGame: {
        JoinedGameResponse joinedGameRoomResponse = JoinedGameResponse.fromRawJson(data);
        handleEventJoinedGame(joinedGameRoomResponse);
      }
      break;
      // case ServerEventUserJoined: {
      //   UserJoinedResponse userJoinedResponse = UserJoinedResponse.fromRawJson(data);
      //   handleEventUserJoined(userJoinedResponse);
      // }
      // break;
      case ServerEventUserJoinedGame: {
        UserJoinedGameResponse userJoinedGameResponse = UserJoinedGameResponse.fromRawJson(data);
        handleEventUserJoinedGame(userJoinedGameResponse);
      }
      break;
      case ServerEventChatMessage: {
        // roomId = data.payload!.roomId;
        // messages.obs.value.add(data);
        // print(messages.value.length);
        // itemCount.value = messages.value.length;
        // print(itemCount.value);
        // print(messages.value);
        ChatMessageResponse chatMessageResponse = ChatMessageResponse.fromRawJson(data);
        print(chatMessageResponse);
        print('chat message response above');
        print(jsonDecode(data)['payload']['message']);
        print('event chat message');
        handleServerEventChatMessage(chatMessageResponse);
      }
      break;
      case ServerEventJoinableGames: {
        print('joinable games event object from server');
        // print(jsonDecode(data)['payload']['games'][0]['UserIDs'][0].runtimeType);
        JoinableGamesResponse joinableGamesResponse = JoinableGamesResponse.fromRawJson(data);
        // print(listJoinableGamesResponse.payload.games[0].usersIds.toString());
        handleServerEventJoinableGames(joinableGamesResponse);
      }
      break;
      case ServerEventGameUpdate: {
        print('received game update');
        GameUpdateResponse gameUpdateResponse = GameUpdateResponse.fromRawJson(data);
        print(gameUpdateResponse.toString());
        handleServerEventGameUpdate(gameUpdateResponse);
      }
      break;
      case ServerEventTimerUpdate: {
        TimerResponse timerResponse = TimerResponse.fromRawJson(data);
        handleServerEventTimerUpdate(timerResponse);
      }
      break;
      case ServerEventFriendRequest: {
        FriendRequestResponse friendRequestResponse = FriendRequestResponse.fromRawJson(data);
        handleFriendRequest(friendRequestResponse);
      }
      break;
      case ServerEventAcceptFriendRequest: {
        AcceptFriendResponse acceptFriendRequest = AcceptFriendResponse.fromRawJson(data);
        handleAcceptFriendRequest(acceptFriendRequest);
      }
      break;
      // case game timer
      default: {
        print('no event in package received');
      }
      break;
    }
  }

  void handleEventListUsers(ListUsersResponse listUsersResponse) {
    usersService.users.addAll(listUsersResponse.payload.users);
  }

  void handleEventNewUser(NewUserResponse newUserResponse) {
    usersService.users.add(newUserResponse.payload.user);
  }

  void handleEventJoinedDMRoom(JoinedDMRoomResponse joinedDMRoomResponse) {
    roomService.addRoom(joinedDMRoomResponse.payload.roomId, joinedDMRoomResponse.payload);
  }

  void handleEventUserJoinedDMRoom(UserJoinedDMRoomResponse userJoinedDMRoomResponse) {
    roomService.roomsMap[userJoinedDMRoomResponse.payload.roomId]!.userIds.add(userJoinedDMRoomResponse.payload.userId);
  }

  void handleEventJoinedRoom(JoinedRoomResponse joinedRoomResponse) {
    // if (joinedRoomResponse.payload.isGameRoom != null
    //       && !joinedRoomResponse.payload.isGameRoom!) {
    //   roomService.addRoom(joinedRoomResponse.payload.roomId, joinedRoomResponse.payload);
    //   return;
    // }
    print('joined game room');
    // if (gameService.currentGameRoom.value == null) {
    //   gameService.currentGameRoom.value = joinedRoomResponse.payload;
    //   gameService.currentGameRoomUserIds.value =
    //       joinedRoomResponse.payload.userIds;
    //   return;
    // }
    // if (joinedRoomResponse.payload.roomId ==
    //     gameService.currentGameRoom.value!.roomId) {
    // gameService.currentGameRoom.value = joinedRoomResponse.payload;
    // gameService.currentGameRoomUserIds.value = joinedRoomResponse.payload.userIds;
    // }
    roomService.addRoom(joinedRoomResponse.payload.roomId, joinedRoomResponse.payload);
  }

  void handleEventUserJoinedRoom(UserJoinedRoomResponse userJoinedRoomResponse) {
    roomService.roomsMap[userJoinedRoomResponse.payload.roomId]!.userIds.add(userJoinedRoomResponse.payload.userId);
  }

  void handleEventJoinedGame(JoinedGameResponse joinedGameResponse) {
    // gameService.currentGameRoom.value = joinedGameRoomResponse.gam
    gameService.currentGameId = joinedGameResponse.payload.id;
    gameService.currentGameRoomUserIds!.add(userService.user.value!.id);
  }

  // void handleEventUserJoined(UserJoinedResponse userJoinedResponse) {
  //   // Room currentGameRoom = gameService.currentGameRoom.value!;
  //   // currentGameRoom.users.add(userJoinedResponse.payload.user);
  //   // gameService.currentGameRoom.value = currentGameRoom;
  //   // print('new current game room state');
  //   // print(gameService.currentGameRoom.value!.users.toString());
  //
  //   if (gameService.currentGameRoom.value == null) return;
  //   if (userJoinedResponse.payload.roomId == gameService.currentGameRoom.value!.roomId) {
  //     gameService.currentGameRoomUserIds!.add(userJoinedResponse.payload.user.id);
  //   }
  // }

  void handleEventUserJoinedGame(UserJoinedGameResponse userJoinedGameResponse) {
    gameService.currentGameRoomUserIds!.add(userJoinedGameResponse.payload.userId);
    print(gameService.currentGameRoomUserIds!.length);
  }

  void handleServerEventChatMessage(ChatMessageResponse chatMessageResponse) {
    // if (gameService.currentGameRoom.value != null) {
    //   if (chatMessageResponse.payload!.roomId ==
    //       gameService.currentGameRoom.value!.roomId) {
    //     gameService.currentRoomMessages.add(chatMessageResponse.payload!);
    //     return;
    //   }
    // }
    if (gameService.currentGame.value != null
      && gameService.isCurrentGameId(chatMessageResponse.payload!.roomId)) {
      gameService.currentRoomMessages.add(chatMessageResponse.payload!);
      return;
    }

    roomService.addMessagePayloadToRoom(chatMessageResponse.payload!.roomId, chatMessageResponse.payload!);
    if (chatMessageResponse.payload!.roomId == roomService.currentRoomId) {
      roomService.currentRoomMessages!.add(chatMessageResponse.payload!);
    }
  }

  void handleServerEventJoinableGames(JoinableGamesResponse joinableGamesResponse) {
    print('before first joinable game userids');
    gameService.joinableGames.value = joinableGamesResponse.payload.games;
    // print(listJoinableGamesResponse.payload.games[0].usersIds.toString());

  }

  void handleServerEventGameUpdate(GameUpdateResponse gameUpdateResponse) {
    if(gameService.currentGame.value == null) {
      gameService.currentGame.value = gameUpdateResponse.payload;
      Get.offAllNamed(Routes.GAME);
    }
    else {
      gameService.currentGame.value = gameUpdateResponse.payload;
    }
  }

  void handleServerEventTimerUpdate(TimerResponse timerResponse) {
    gameService.currentGameTimer.value = timerResponse.payload.timer;
  }

  void handleFriendRequest(FriendRequestResponse friendRequestResponse) {
    userService.user.value!.pendingRequests.add(friendRequestResponse.payload!.fromUsername);
    userService.pendingRequest.add(friendRequestResponse.payload!.fromUsername);
  }

  void handleAcceptFriendRequest(AcceptFriendResponse acceptFriendRequest) {
    userService.user.value!.pendingRequests.remove(acceptFriendRequest.payload!.fromUsername);
    userService.user.value!.friends.add(acceptFriendRequest.payload!.fromId);
    userService.friends.add(acceptFriendRequest.payload!.fromUsername);
    // createDMRoom(acceptFriendRequest.payload!.fromId, acceptFriendRequest.payload!.fromUsername);
  }

  void createRoom(String roomName, { List<String> userIds = const [] }) {
    final createRoomPayload = CreateRoomPayload(
        roomName: roomName,
        userIds: userIds
    );
    final createRoomRequest = CreateRoomRequest(
      event: ClientEventCreateRoom,
      payload: createRoomPayload
    );
    socket.sink.add(createRoomRequest.toRawJson());
  }

  void createDMRoom(String toId, String toUsername) {
    final createDMRoomPayload = CreateDMRoomPayload(
        username: userService.user.value!.username,
        toId: toId,
        toUsername: toUsername
    );
    final createRoomRequest = CreateDMRoomRequest(
        event: ClientEventCreateDMRoom,
        payload: createDMRoomPayload
    );
    socket.sink.add(createRoomRequest.toRawJson());
  }

  void createGameRoom({ List<String> userIds = const [] }) {
    final createGameRoomPayload = CreateGameRoomPayload(
        userIds: userIds
    );
    final createGameRoomRequest = CreateGameRoomRequest(
        event: ClientEventCreateGame,
        payload: createGameRoomPayload
    );
    socket.sink.add(createGameRoomRequest.toRawJson());
  }

  // void joinRoom(String roomId) {
  //   final joinRoomPayload = JoinRoomPayload(roomId: roomId);
  //   final joinRoomRequest = JoinRoomRequest(
  //       event: ClientEventJoinRoom,
  //       payload: joinRoomPayload
  //   );
  //   socket.sink.add(joinRoomRequest.toRawJson());
  // }

  // void joinDMRoom(String toId, String toUsername) {
  //   final joinDMPayload = JoinDMPayload(
  //       username: userService.user.value!.username,
  //       toId: toId,
  //       toUsername: toUsername
  //   );
  //   final joinDMRequest = JoinDMRequest(
  //       event: ClientEventJoinDMRoom,
  //       payload: joinDMPayload
  //   );
  //   socket.sink.add(joinDMRequest.toRawJson());
  // }

  void joinGame(String gameId) {
    final joinGameRoomPayload = JoinRoomPayload(gameId: gameId);
    final joinGameRoomRequest = JoinRoomRequest(
        event: ClientEventJoinGame,
        payload: joinGameRoomPayload
    );
    socket.sink.add(joinGameRoomRequest.toRawJson());
  }

  void sendMessage(String roomId, String message) {
    final chatMessagePayload = ChatMessagePayload(
        roomId: roomId,
        message: message,
        from: userService.user.value!.username,
        fromId: userService.user.value!.id
    );
    final chatMessageRequest = ChatMessageRequest(
      event: ClientEventChatMessage,
      payload: chatMessagePayload,
    );
    socket.sink.add(chatMessageRequest.toRawJson());
  }

  void listJoinableGames() {
    final listJoinableGamesRequest = ListJoinableGamesRequest(
      event: ClientEventListJoinableGames
    );
    socket.sink.add(listJoinableGamesRequest.toRawJson());
  }

  void startGame(String gameId) {
    final startGamePayload = StartGamePayload(gameId: gameId);
    final startGameRequest = StartGameRequest(
      event: ClientEventStartGame,
      payload: startGamePayload
    );
    socket.sink.add(startGameRequest.toRawJson());
  }

  void playMove(MoveInfo moveInfo) {
    final playMovePayload = PlayMovePayload(
        gameId: gameService.currentGameId,
        moveInfo: moveInfo
    );
    final playMoveRequest = PlayMoveRequest(
      event: ClientEventPlayMove,
      payload: playMovePayload
    );
    socket.sink.add(playMoveRequest.toRawJson());
  }
}