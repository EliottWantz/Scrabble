import 'dart:convert';

// import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:client_leger/api/api_constants.dart';
import 'package:client_leger/controllers/game_controller.dart';
import 'package:client_leger/models/chat_message_payload.dart';
import 'package:client_leger/models/chat_room.dart';
import 'package:client_leger/models/create_room_payload.dart';
import 'package:client_leger/models/create_tournament_payload.dart';
import 'package:client_leger/models/events.dart';
import 'package:client_leger/models/first_square_payload.dart';
import 'package:client_leger/models/join_chat_room_payload.dart';
import 'package:client_leger/models/join_game_payload.dart';
import 'package:client_leger/models/join_room_payload.dart';
import 'package:client_leger/models/join_tournament_payload.dart';
import 'package:client_leger/models/play_move_payload.dart';
import 'package:client_leger/models/position.dart';
import 'package:client_leger/models/requests/chat_message_request.dart';
import 'package:client_leger/models/requests/create_dm_room_request.dart';
import 'package:client_leger/models/requests/create_game_room_request.dart';
import 'package:client_leger/models/requests/create_tournament_request.dart';
import 'package:client_leger/models/requests/first_square_request.dart';
import 'package:client_leger/models/requests/indice_request.dart';
import 'package:client_leger/models/requests/join_chat_room_request.dart';
import 'package:client_leger/models/requests/join_game_as_observer_request.dart';
import 'package:client_leger/models/requests/join_room_request.dart';
import 'package:client_leger/models/requests/join_tournament_request.dart';
import 'package:client_leger/models/requests/play_move_request.dart';
import 'package:client_leger/models/requests/replace_bot_by_observer.dart';
import 'package:client_leger/models/requests/start_tournament_request.dart';
import 'package:client_leger/models/response/accept_friend_response.dart';
import 'package:client_leger/models/response/chat_message_response.dart';
import 'package:client_leger/models/response/friend_request_response.dart';
import 'package:client_leger/models/response/game_over_response.dart';
import 'package:client_leger/models/response/game_update_response.dart';
import 'package:client_leger/models/response/indice_response.dart';
import 'package:client_leger/models/response/invited_to_game_response.dart';
import 'package:client_leger/models/response/joined_dm_room_response.dart';
import 'package:client_leger/models/response/joined_game_as_observer_response.dart';
import 'package:client_leger/models/response/joined_game_response.dart';
import 'package:client_leger/models/response/joined_room_response.dart';
import 'package:client_leger/models/response/joined_tournament_response.dart';
import 'package:client_leger/models/response/left_game_response.dart';
import 'package:client_leger/models/response/left_room_response.dart';
import 'package:client_leger/models/response/list_chat_rooms_response.dart';
import 'package:client_leger/models/response/list_joinable_tournaments_response.dart';
import 'package:client_leger/models/response/list_observable_games_response.dart';
import 'package:client_leger/models/response/list_observable_tournaments_response.dart';
import 'package:client_leger/models/response/list_users_response.dart';
import 'package:client_leger/models/response/server_error_response.dart';
import 'package:client_leger/models/response/timer_response.dart';
import 'package:client_leger/models/response/tournament_update_response.dart';
import 'package:client_leger/models/response/user_joined_game_response.dart';
import 'package:client_leger/models/response/user_joined_room_response.dart';
import 'package:client_leger/models/response/user_joined_tournament_response.dart';
import 'package:client_leger/models/response/user_request_to_join_game_accepted_response.dart';
import 'package:client_leger/models/response/user_request_to_join_game_response.dart';
import 'package:client_leger/models/start_game_payload.dart';
import 'package:client_leger/models/start_tournament_payload.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/notification_service.dart';
import 'package:client_leger/services/room_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/services/users_service.dart';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:get/get.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../models/create_dm_room_payload.dart';
import '../models/create_game_room_payload.dart';
import '../models/indice_payload.dart';
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
  final NotificationService notificationService = Get.find();

  WebsocketService(
      {required this.userService,
      required this.usersService,
      required this.roomService});

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
        queryParameters: {
          'id': userService.user.value!.id,
          'username': userService.user.value!.username
        }));
    socket.stream.listen(
      (data) {
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
    switch (jsonDecode(data)['event']) {
      case ServerEventListUsers:
        {
          ListUsersResponse listUsersResponse =
              ListUsersResponse.fromRawJson(data);
          handleEventListUsers(listUsersResponse);
        }
        break;
      case ServerEventListOnlineUsers:
        {
          ListUsersResponse listUsersResponse =
              ListUsersResponse.fromRawJson(data);
          handleEventListOnlineUsers(listUsersResponse);
        }
        break;
      case ServerEventListChatRooms:
        {
          ListChatRoomsResponse listChatRoomsResponse =
              ListChatRoomsResponse.fromRawJson(data);
          handleEventListChatRooms(listChatRoomsResponse);
        }
        break;
      case ServerEventNewUser:
        {
          NewUserResponse newUserResponse = NewUserResponse.fromRawJson(data);
          handleEventNewUser(newUserResponse);
        }
        break;
      case ServerEventJoinedDMRoom:
        {
          JoinedDMRoomResponse joinedDMRoomResponse =
              JoinedDMRoomResponse.fromRawJson(data);
          handleEventJoinedDMRoom(joinedDMRoomResponse);
        }
        break;
      case ServerEventUserJoinedDMRoom:
        {
          UserJoinedDMRoomResponse userJoinedDMRoomResponse =
              UserJoinedDMRoomResponse.fromRawJson(data);
          handleEventUserJoinedDMRoom(userJoinedDMRoomResponse);
        }
        break;
        break;
      case ServerEventJoinedRoom:
        {
          print('event joinedRoom');
          JoinedRoomResponse joinedRoomResponse =
              JoinedRoomResponse.fromRawJson(data);
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
      case ServerEventUserJoinedRoom:
        {
          UserJoinedRoomResponse userJoinedRoomResponse =
              UserJoinedRoomResponse.fromRawJson(data);
          handleEventUserJoinedRoom(userJoinedRoomResponse);
        }
        break;
      case ServerEventLeftGame:
        {
          LeftGameResponse leftGameResponse =
              LeftGameResponse.fromRawJson(data);
          handleEventLeftGame(leftGameResponse);
        }
        break;
      case ServerEventLeftRoom:
        {
          LeftRoomResponse leftRoomResponse =
              LeftRoomResponse.fromRawJson(data);
          handleEventLeftRoom(leftRoomResponse);
        }
        break;
      case ServerEventJoinedGame:
        {
          JoinedGameResponse joinedGameRoomResponse =
              JoinedGameResponse.fromRawJson(data);
          handleEventJoinedGame(joinedGameRoomResponse);
        }
        break;
      case ServerEventJoinedGameAsObserver:
        {
          JoinedGameAsObserverResponse joinedGameAsObserver =
              JoinedGameAsObserverResponse.fromRawJson(data);
          handleEventJoinedGameAsObserver(joinedGameAsObserver);
        }
        break;
      // case ServerEventUserJoined: {
      //   UserJoinedResponse userJoinedResponse = UserJoinedResponse.fromRawJson(data);
      //   handleEventUserJoined(userJoinedResponse);
      // }
      // break;
      case ServerEventUserJoinedGame:
        {
          UserJoinedGameResponse userJoinedGameResponse =
              UserJoinedGameResponse.fromRawJson(data);
          handleEventUserJoinedGame(userJoinedGameResponse);
        }
        break;
      case ServerEventJoinedTournament:
        {
          JoinedTournamentResponse joinedTournamentResponse =
              JoinedTournamentResponse.fromRawJson(data);
          handleEventJoinedTournament(joinedTournamentResponse);
        }
        break;
      case ServerEventUserJoinedTournament:
        {
          UserJoinedTournamentResponse userJoinedTournamentResponse =
              UserJoinedTournamentResponse.fromRawJson(data);
          handleEventUserJoinedTournament(userJoinedTournamentResponse);
        }
        break;
      case ServerEventChatMessage:
        {
          // roomId = data.payload!.roomId;
          // messages.obs.value.add(data);
          // print(messages.value.length);
          // itemCount.value = messages.value.length;
          // print(itemCount.value);
          // print(messages.value);
          ChatMessageResponse chatMessageResponse =
              ChatMessageResponse.fromRawJson(data);
          print(chatMessageResponse);
          print('chat message response above');
          print(jsonDecode(data)['payload']['message']);
          print('event chat message');
          handleServerEventChatMessage(chatMessageResponse);
        }
        break;
      case ServerEventJoinableGames:
        {
          print('joinable games event object from server');
          // print(jsonDecode(data)['payload']['games'][0]['UserIDs'][0].runtimeType);
          JoinableGamesResponse joinableGamesResponse =
              JoinableGamesResponse.fromRawJson(data);
          // print(listJoinableGamesResponse.payload.games[0].usersIds.toString());
          handleServerEventJoinableGames(joinableGamesResponse);
        }
        break;
      case ServerEventJoinableTournaments:
        {
          JoinableTournamentsResponse joinableTournamentsResponse =
              JoinableTournamentsResponse.fromRawJson(data);
          handleServerEventJoinableTournaments(joinableTournamentsResponse);
        }
        break;
      case ServerEventObservableGames:
        {
          ObservableGamesResponse observableGamesResponse =
              ObservableGamesResponse.fromRawJson(data);
          handleServerEventObservableGames(observableGamesResponse);
        }
        break;
      case ServerEventObservableTournaments:
        {
          ObservableTournamentsResponse observableTournamentsResponse =
              ObservableTournamentsResponse.fromRawJson(data);
          handleServerEventObservableTournaments(observableTournamentsResponse);
        }
        break;
      case ServerEventGameUpdate:
        {
          print('received game update');
          GameUpdateResponse gameUpdateResponse =
              GameUpdateResponse.fromRawJson(data);
          print(gameUpdateResponse.toString());
          handleServerEventGameUpdate(gameUpdateResponse);
        }
        break;
      case ServerEventTournamentUpdate:
        {
          TournamentUpdateResponse tournamentUpdateResponse =
              TournamentUpdateResponse.fromRawJson(data);
          handleServerEventTournamentUpdate(tournamentUpdateResponse);
        }
        break;
      case ServerEventTimerUpdate:
        {
          TimerResponse timerResponse = TimerResponse.fromRawJson(data);
          handleServerEventTimerUpdate(timerResponse);
        }
        break;
      case ServerEventGameOver:
        {
          GameOverResponse gameOverResponse =
              GameOverResponse.fromRawJson(data);
          handleServerEventGameOver(gameOverResponse);
        }
        break;
      case ServerEventFriendRequest:
        {
          FriendRequestResponse friendRequestResponse =
              FriendRequestResponse.fromRawJson(data);
          handleFriendRequest(friendRequestResponse);
        }
        break;
      case ServerEventAcceptFriendRequest:
        {
          AcceptFriendResponse acceptFriendRequest =
              AcceptFriendResponse.fromRawJson(data);
          handleAcceptFriendRequest(acceptFriendRequest);
        }
        break;
      case ServerEventUserRequestToJoinGame:
        {
          UserRequestToJoinGameResponse userRequestToJoinGameResponse =
              UserRequestToJoinGameResponse.fromRawJson(data);
          handleUserRequestToJoinGame(userRequestToJoinGameResponse);
        }
        break;
      case ServerEventUserRequestToJoinGameAccepted:
        {
          UserRequestToJoinGameAcceptedResponse userRequestToJoinGameAccepted =
              UserRequestToJoinGameAcceptedResponse.fromRawJson(data);
          handleUserRequestToJoinGameAccepted(userRequestToJoinGameAccepted);
        }
        break;
      case ServerEventRevokeRequestToJoinGame:
        {
          UserRequestToJoinGameAcceptedResponse userRequestToJoinGameAccepted =
              UserRequestToJoinGameAcceptedResponse.fromRawJson(data);
          handleRevokeRequestToJoinGame(userRequestToJoinGameAccepted);
        }
        break;
      case ServerEventUserRequestToJoinGameDeclined:
        {
          UserRequestToJoinGameAcceptedResponse userRequestToJoinGameAccepted =
              UserRequestToJoinGameAcceptedResponse.fromRawJson(data);
          handleUserRequestToJoinGameDeclined(userRequestToJoinGameAccepted);
        }
        break;
      case ServerEventIndice:
        {
          IndiceResponse indiceResponse = IndiceResponse.fromRawJson(data);
          handleIndiceResponse(indiceResponse);
        }
        break;
      case ClientEventFirstSquare:
        {
          if (Get.isRegistered<GameController>()) {
            GameController gameController = Get.find();
            gameController.currentFirstLetter.value =
                FirstSquareRequest.fromRawJson(data).payload.coordinates;
          }
        }
        break;
      case ClientEventRemoveFirstSquare:
        {
          if (Get.isRegistered<GameController>()) {
            GameController gameController = Get.find();
            gameController.currentFirstLetter.value = null;
          }
        }
        break;
      case ServerEventInvitedToGame:
        {
          InvitedToGameResponse invitedToGameResponse =
              InvitedToGameResponse.fromRawJson(data);
          handleInvitedToGameResponse(invitedToGameResponse);
        }
        break;
      case ServerEventError:
        {
          ErrorResponse errorResponse = ErrorResponse.fromRawJson(data);
          handleErrorResponse(errorResponse);
        }
        break;
      default:
        {
          print('no event in package received');
        }
        break;
    }
  }

  void handleEventListUsers(ListUsersResponse listUsersResponse) {
    usersService.users.addAll(listUsersResponse.payload.users);
  }

  void handleEventListOnlineUsers(ListUsersResponse listUsersResponse) {
    usersService.onlineUsers.value.clear();
    usersService.onlineUsers.addAll(listUsersResponse.payload.users);

    // List<String> friendUsernames = usersService.getUsernamesFromUserIds(userService.friends.value);

    List<String> onlineFriendIds = usersService.getOnlineFriendIds();
    onlineFriendIds.sort();
    List<String> offlineFriendIds = usersService.getOfflineFriendIds();
    offlineFriendIds.sort();
    onlineFriendIds.addAll(offlineFriendIds);
    userService.friends.value.clear();
    userService.friends.addAll(onlineFriendIds);
    userService.friends.refresh();
  }

  void handleEventListChatRooms(ListChatRoomsResponse listChatRoomsResponse) {
    roomService.listedChatRooms.value.clear();
    for (ChatRoom chatRoom in listChatRoomsResponse.payload.chatRooms) {
      if (!chatRoom.name.contains('/')) {
        roomService.listedChatRooms.add(chatRoom);
      }
    }
    roomService.listedChatRooms.refresh();
  }

  void handleEventNewUser(NewUserResponse newUserResponse) {
    usersService.users.add(newUserResponse.payload.user);
  }

  void handleEventJoinedDMRoom(JoinedDMRoomResponse joinedDMRoomResponse) {
    roomService.addRoom(
        joinedDMRoomResponse.payload.roomId, joinedDMRoomResponse.payload);
  }

  void handleEventUserJoinedDMRoom(
      UserJoinedDMRoomResponse userJoinedDMRoomResponse) {
    roomService.roomsMap[userJoinedDMRoomResponse.payload.roomId]!.userIds
        .add(userJoinedDMRoomResponse.payload.userId);
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
    roomService.addRoom(
        joinedRoomResponse.payload.roomId, joinedRoomResponse.payload);
  }

  void handleEventUserJoinedRoom(
      UserJoinedRoomResponse userJoinedRoomResponse) {
    roomService.roomsMap[userJoinedRoomResponse.payload.roomId]!.userIds
        .add(userJoinedRoomResponse.payload.userId);
  }

  void handleEventLeftGame(LeftGameResponse leftGameResponse) {
    // gameService.currentGame.value = null;
    // roomService.roomsMap.remove(gameService.currentGameId);
    // gameService.currentGameId = '';
    // gameService.currentGameTimer.value = null;
    // gameService.currentGameInfo = null;
    // gameService.currentGameInfoInitialized = false;
    // gameService.currentGameRoomUserIds.value = [];
    // if (gameService.currentGame.value == null) {
    //   // Get.toNamed(Routes.HOME + Routes.GAME_START + Routes.LOBBY);
    //   // Get.back();
    //   // Get.back();
    //   Get.offAllNamed(Routes.HOME);
    // }

    if (Get.isRegistered<GameController>()) {
      GameController gameController = Get.find();
      if (gameService.currentTournament.value != null) {
        // if in tournament
        if (gameService.currentTournament.value!.finale != null) {
          // if finale has started
          gameController.showGameOverDialog(gameService.currentGameWinner);
        } else if (gameService.currentTournament.value!.poolGames[0].id ==
                gameService.currentGameId &&
            gameService.currentTournament.value!.poolGames[1].winnerId == "") {
          // if 1st pool game has finished and 2nd is still in play
          if (!userService.isCurrentUser(gameService.currentGameWinner) &&
              gameService.currentTournament.value!.userIds
                  .contains(userService.user.value!.id)) {
            // Loser of game and observing
            gameController.showPoolGameLoserDialog(
                gameService.currentTournament.value!.poolGames[1].id);
          } else if (userService.isCurrentUser(gameService.currentGameWinner)) {
            // Winner of game
            gameService.leftGame();
          } else {
            // Observer of game and didn't play
            gameController.showTournamentObserverJoinOtherPoolGameDialog(
                gameService.currentTournament.value!.poolGames[1].id);
          }
        } else if (gameService.currentTournament.value!.poolGames[0].id ==
                gameService.currentGameId &&
            gameService.currentTournament.value!.poolGames[1].winnerId != "") {
          // if 1st pool game has finished and 2nd has finished
          if (userService.isCurrentUser(
              gameService.currentTournament.value!.poolGames[1].winnerId!)) {
            gameService.leftGame();
          } else if (!userService
                  .isCurrentUser(gameService.currentGameWinner) &&
              gameService.currentTournament.value!.userIds
                  .contains(userService.user.value!.id)) {
            gameController.showJoinFinaleDialogForObserverAndLoser();
          } else if (userService.isCurrentUser(gameService.currentGameWinner)) {
            // Winner of game
            gameService.leftGame();
          } else {
            // Observer of game and didn't play
            gameController.showTournamentObserverPoolGameOverDialog();
          }
        } else if (gameService.currentTournament.value!.poolGames[1].id ==
                gameService.currentGameId &&
            gameService.currentTournament.value!.poolGames[0].winnerId == "") {
          // if 2nd pool game has finished and 1st is still in play
          if (!userService.isCurrentUser(gameService.currentGameWinner)) {
            gameController.showPoolGameLoserDialog(
                gameService.currentTournament.value!.poolGames[0].id);
          } else {
            gameService.leftGame();
          }
        } else if (gameService.currentTournament.value!.poolGames[1].id ==
                gameService.currentGameId &&
            gameService.currentTournament.value!.poolGames[0].winnerId != "") {
          // if 2nd pool game has finished and 1st has finished
          if (userService.isCurrentUser(
              gameService.currentTournament.value!.poolGames[0].winnerId!)) {
            gameService.leftGame();
          } else if (!userService
              .isCurrentUser(gameService.currentGameWinner)) {
            gameController.showJoinFinaleDialogForObserverAndLoser();
            // gameController.showPoolGameLoserDialog(
            //     gameService.currentTournament.value!.finale!.id);
          } else {
            gameService.leftGame();
          }
        } else {
          gameController.showPoolGameLoserDialog(
              gameService.currentTournament.value!.poolGames[0].id);
        }
      } else {
        gameController.showGameOverDialog(gameService.currentGameWinner);
      }
    } else {
      gameService.leftGame();
      Get.back();
      Get.back();
    }
  }

  void handleEventLeftRoom(LeftRoomResponse leftRoomResponse) {
    roomService.removeRoom(leftRoomResponse.payload.roomId);
    DialogHelper.showLeftRoomDialog();
  }

  void handleEventJoinedGame(JoinedGameResponse joinedGameResponse) {
    // gameService.currentGameRoom.value = joinedGameRoomResponse.gam
    if (gameService.currentTournament.value != null) {}
    gameService.currentGameId = joinedGameResponse.payload.id;
    gameService.currentGameInfoInitialized = true;
    gameService.currentGameInfo = joinedGameResponse.payload;
    gameService.currentGameRoomUserIds!.add(userService.user.value!.id);
    Room gameRoom = Room(
        roomId: joinedGameResponse.payload.id,
        roomName: 'Game Room',
        userIds: joinedGameResponse.payload.userIds,
        messages: <ChatMessagePayload>[]);
    roomService.addRoom(joinedGameResponse.payload.id, gameRoom);
    final currentGame =
        gameService.getJoinableGameById(gameService.currentGameId);
    if (currentGame != null) {
      gameService.currentGameRoomUserIds.addAll(currentGame!.userIds);
    }
    Get.toNamed(Routes.HOME + Routes.GAME_START + Routes.LOBBY, arguments: '');
  }

  void handleEventJoinedGameAsObserver(
      JoinedGameAsObserverResponse joinedGameAsObserverResponse) {
    gameService.currentGameId = joinedGameAsObserverResponse.payload.game.id;
    gameService.currentGameInfoInitialized = true;
    gameService.currentGameInfo = joinedGameAsObserverResponse.payload.game;
    gameService.currentGameRoomObserverIds!.add(userService.user.value!.id);
    Room gameRoom = Room(
        roomId: joinedGameAsObserverResponse.payload.game.id,
        roomName: 'Game Room',
        userIds: joinedGameAsObserverResponse.payload.game.userIds,
        messages: <ChatMessagePayload>[]);
    roomService.addRoom(joinedGameAsObserverResponse.payload.game.id, gameRoom);
    gameService.currentGameRoomUserIds
        .addAll(joinedGameAsObserverResponse!.payload.game.userIds);

    gameService.currentGame.value =
        joinedGameAsObserverResponse.payload.gameUpdate;
    bool isObserving = true;
    Get.offAllNamed(Routes.GAME, arguments: isObserving);
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

  void handleEventUserJoinedGame(
      UserJoinedGameResponse userJoinedGameResponse) {
    gameService.currentGameRoomUserIds!
        .add(userJoinedGameResponse.payload.userId);

    if (gameService.currentGameInfo!.isPrivateGame) {
      if (gameService.currentGameInfo!.creatorId !=
          userService.user.value!.id) {
        return;
      }
      gameService.pendingJoinGameRequestUserIds
          .remove(userJoinedGameResponse.payload.userId);
    }
  }

  void handleEventJoinedTournament(
      JoinedTournamentResponse joinedTournamentResponse) {
    gameService.currentTournamentId = joinedTournamentResponse.payload.id;
    // gameService.currentTournamentInfo = joinedTournamentResponse.payload;
    gameService.currentTournament.value = joinedTournamentResponse.payload;
    gameService.currentTournamentUserIds!.add(userService.user.value!.id);
    Room tournamentRoom = Room(
        roomId: joinedTournamentResponse.payload.id,
        roomName: 'Tournament Room',
        userIds: joinedTournamentResponse.payload.userIds,
        messages: <ChatMessagePayload>[]);
    roomService.addRoom(joinedTournamentResponse.payload.id, tournamentRoom);
    final currentTournament =
        gameService.getJoinableTournamentById(gameService.currentTournamentId);
    if (currentTournament != null) {
      gameService.currentTournamentUserIds.addAll(currentTournament!.userIds);
    }
    Get.toNamed(Routes.HOME + Routes.GAME_START + Routes.LOBBY,
        arguments: 'tournoi');
  }

  void handleEventUserJoinedTournament(
      UserJoinedTournamentResponse userJoinedTournamentResponse) {
    gameService.currentTournamentUserIds!
        .add(userJoinedTournamentResponse.payload.userId);

    if (gameService.currentTournament.value!.isPrivate) {
      if (gameService.currentTournament.value!.creatorId !=
          userService.user.value!.id) {
        return;
      }
      gameService.pendingJoinTournamentRequestUserIds
          .remove(userJoinedTournamentResponse.payload.userId);
    }
  }

  void handleServerEventChatMessage(ChatMessageResponse chatMessageResponse) {
    // if (gameService.currentGameRoom.value != null) {
    //   if (chatMessageResponse.payload!.roomId ==
    //       gameService.currentGameRoom.value!.roomId) {
    //     gameService.currentRoomMessages.add(chatMessageResponse.payload!);
    //     return;
    //   }
    // }
    if (gameService.currentGame.value != null &&
        gameService.isCurrentGameId(chatMessageResponse.payload!.roomId)) {
      gameService.currentRoomMessages.add(chatMessageResponse.payload!);
      roomService.currentFloatingRoomMessages!
          .add(chatMessageResponse.payload!);
      roomService.addMessagePayloadToRoom(
          chatMessageResponse.payload!.roomId, chatMessageResponse.payload!);
      return;
    }

    roomService.addMessagePayloadToRoom(
        chatMessageResponse.payload!.roomId, chatMessageResponse.payload!);
    if (chatMessageResponse.payload!.roomId == roomService.currentRoomId) {
      roomService.currentRoomMessages!.add(chatMessageResponse.payload!);
    }
    if (chatMessageResponse.payload!.roomId ==
        roomService.currentFloatingChatRoomId.value) {
      roomService.currentFloatingRoomMessages!
          .add(chatMessageResponse.payload!);
    }
  }

  void handleServerEventJoinableGames(
      JoinableGamesResponse joinableGamesResponse) {
    print('before first joinable game userids');
    gameService.joinableGames.value = joinableGamesResponse.payload.games;
    // print(listJoinableGamesResponse.payload.games[0].usersIds.toString());
  }

  void handleServerEventJoinableTournaments(
      JoinableTournamentsResponse joinableTournamentsResponse) {
    gameService.joinableTournaments.value =
        joinableTournamentsResponse.payload.tournaments;
  }

  void handleServerEventObservableGames(
      ObservableGamesResponse observableGamesResponse) {
    gameService.observableGames.value = observableGamesResponse.payload.games;
  }

  void handleServerEventObservableTournaments(
      ObservableTournamentsResponse observableTournamentsResponse) {
    gameService.observableTournaments.value =
        observableTournamentsResponse.payload.tournaments;
  }

  void handleServerEventGameUpdate(GameUpdateResponse gameUpdateResponse) {
    if (gameService.currentGame.value == null) {
      gameService.currentGame.value = gameUpdateResponse.payload;
      bool isObserving = false;
      getIndices();
      Get.offAllNamed(Routes.GAME, arguments: isObserving);
    } else if (Get.isRegistered<GameController>()) {
      gameService.currentGame.value = gameUpdateResponse.payload;
      GameController gameController = Get.find();
      gameController.currentFirstLetter.value = null;
      gameController.currentIndiceToPlay.value = null;
      gameController.currentSpecialLetter.value = 'A';
      gameController.lettersPlaced.value = [];
      gameController.lettersToExchange.value = {};
      gameService.indices.value = [];
      gameService.getIndicesHasBeenCalled = false;
      gameController.getIndices();
      if (gameController.isObserverSwitchedConfirmation) {
        gameController.isObserverSwitched.value = true;
      }
      if (Get.isBottomSheetOpen ?? false) {
        Get.back();
        Get.isBottomSheetOpen == true ? Get.back() : null;
      }
    }
  }

  void handleServerEventTournamentUpdate(
      TournamentUpdateResponse tournamentUpdateResponse) {
    gameService.currentTournament.value = tournamentUpdateResponse.payload;
    gameService.updateLoserObservableGameId();
  }

  void handleServerEventTimerUpdate(TimerResponse timerResponse) {
    gameService.currentGameTimer.value = timerResponse.payload.timer;
  }

  void handleServerEventGameOver(GameOverResponse gameOverResponse) {
    // GameController gameController = Get.find();
    // if (gameService.currentTournament.value != null) {
    //   // if in tournament
    //   if (gameService.currentTournament.value!.finale != null) {
    //     // if finale has started
    //     gameController.showGameOverDialog(gameOverResponse.payload.winnerId);
    //   } else if (gameService
    //       .currentTournament.value!.poolGames[0].winnerId!.isNotEmpty) {
    //     // if 1st pool game has finished
    //     if (!gameService.isCurrentPlayer(gameOverResponse.payload.winnerId)) {
    //       gameController.showPoolGameLoserDialog(
    //           gameService.currentTournament.value!.poolGames[1].id);
    //     }
    //   } else {
    //     gameController.showPoolGameLoserDialog(
    //         gameService.currentTournament.value!.poolGames[0].id);
    //   }
    // } else {
    //   gameController.showGameOverDialog(gameOverResponse.payload.winnerId);
    // }
    gameService.currentGameWinner = gameOverResponse.payload.winnerId;
  }

  void handleFriendRequest(FriendRequestResponse friendRequestResponse) {
    userService.user.value!.pendingRequests
        .add(friendRequestResponse.payload!.fromUsername);
    userService.pendingRequest.add(friendRequestResponse.payload!.fromUsername);
  }

  void handleAcceptFriendRequest(AcceptFriendResponse acceptFriendRequest) {
    userService.user.value!.pendingRequests
        .remove(acceptFriendRequest.payload!.fromUsername);
    userService.user.value!.friends.add(acceptFriendRequest.payload!.fromId);
    userService.friends.add(acceptFriendRequest.payload!.fromId);
    // createDMRoom(acceptFriendRequest.payload!.fromId, acceptFriendRequest.payload!.fromUsername);
  }

  void handleUserRequestToJoinGame(
      UserRequestToJoinGameResponse userRequestToJoinGameResponse) {
    if (userService.user.value!.id != gameService.currentGameInfo!.creatorId) {
      return;
    }
    if (!gameService.currentGameInfo!.isPrivateGame) {
      return;
    }
    gameService.pendingJoinGameRequestUserIds
        .add(userRequestToJoinGameResponse.payload.userId);
  }

  void handleUserRequestToJoinGameAccepted(
      UserRequestToJoinGameAcceptedResponse
          userRequestToJoinGameAcceptedResponse) {
    DialogHelper.hideLoading();
  }

  void handleRevokeRequestToJoinGame(
      UserRequestToJoinGameAcceptedResponse
          userRequestToJoinGameAcceptedResponse) {
    if (userService.user.value!.id != gameService.currentGameInfo!.creatorId) {
      return;
    }
    if (!gameService.currentGameInfo!.isPrivateGame) {
      return;
    }
    gameService.pendingJoinGameRequestUserIds
        .remove(userRequestToJoinGameAcceptedResponse.payload.userId);
  }

  void handleUserRequestToJoinGameDeclined(
      UserRequestToJoinGameAcceptedResponse
          userRequestToJoinGameAcceptedResponse) {
    DialogHelper.hideLoading();
    DialogHelper.showJoinGameRequestRejected();
  }

  void handleIndiceResponse(IndiceResponse indiceResponse) {
    if (indiceResponse.payload.isEmpty) return;
    gameService.indices.addAll(indiceResponse.payload);
  }

  void handleInvitedToGameResponse(
      InvitedToGameResponse invitedToGameResponse) {
    notificationService.gameInviteNotifications
        .add(invitedToGameResponse.payload!);
    DialogHelper.showInvitedToGameDialog(
        invitedToGameResponse.payload.inviterId,
        invitedToGameResponse.payload.game.id);
  }

  void handleErrorResponse(ErrorResponse errorResponse) {
    switch (errorResponse.payload.error) {
      case JoinGamePasswordMismatch:
        {
          DialogHelper.showErrorDialog(
              description: JoinGamePasswordMismatchMessage);
        }
        break;
      default:
        {
          print('error treated by default case');
          DialogHelper.showErrorDialog(
              description: errorResponse.payload.error);
        }
    }
  }

  void createRoom(String roomName, {List<String> userIds = const []}) {
    final createRoomPayload =
        CreateRoomPayload(roomName: roomName, userIds: userIds);
    final createRoomRequest = CreateRoomRequest(
        event: ClientEventCreateRoom, payload: createRoomPayload);
    socket.sink.add(createRoomRequest.toRawJson());
  }

  void createDMRoom(String toId, String toUsername) {
    final createDMRoomPayload = CreateDMRoomPayload(
        username: userService.user.value!.username,
        toId: toId,
        toUsername: toUsername);
    final createRoomRequest = CreateDMRoomRequest(
        event: ClientEventCreateDMRoom, payload: createDMRoomPayload);
    socket.sink.add(createRoomRequest.toRawJson());
  }

  void createGameRoom(
      {List<String> userIds = const [],
      bool isPrivate = false,
      String password = ''}) {
    final createGameRoomPayload = CreateGameRoomPayload(
        isPrivate: isPrivate, password: password, withUserIds: userIds);
    final createGameRoomRequest = CreateGameRoomRequest(
        event: ClientEventCreateGame, payload: createGameRoomPayload);
    socket.sink.add(createGameRoomRequest.toRawJson());
  }

  void createTournament(
      {List<String> userIds = const [], bool isPrivate = false}) {
    final createTournamentPayload =
        CreateTournamentPayload(isPrivate: isPrivate, withUserIds: userIds);
    final createTournamentRequest = CreateTournamentRequest(
        event: ClientEventCreateTournament, payload: createTournamentPayload);
    socket.sink.add(createTournamentRequest.toRawJson());
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

  void joinGame(String gameId, {String password = ''}) {
    final joinGameRoomPayload =
        JoinRoomPayload(gameId: gameId, password: password);
    final joinGameRoomRequest = JoinRoomRequest(
        event: ClientEventJoinGame, payload: joinGameRoomPayload);
    socket.sink.add(joinGameRoomRequest.toRawJson());
  }

  void joinChatRoom(String roomId) {
    final joinChatRoomPayload = JoinChatRoomPayload(roomId: roomId);
    final joinChatRoomRequest = JoinChatRoomRequest(
        event: ClientEventJoinRoom, payload: joinChatRoomPayload);
    socket.sink.add(joinChatRoomRequest.toRawJson());
  }

  void joinTournament(String tournamentId, {String password = ''}) {
    final joinTournamentPayload =
        JoinTournamentPayload(tournamentId: tournamentId, password: password);
    final joinTournamentRequest = JoinTournamentRequest(
        event: ClientEventJoinTournament, payload: joinTournamentPayload);
    socket.sink.add(joinTournamentRequest.toRawJson());
  }

  void sendMessage(String roomId, String message) {
    final chatMessagePayload = ChatMessagePayload(
        roomId: roomId,
        message: message,
        from: userService.user.value!.username,
        fromId: userService.user.value!.id);
    final chatMessageRequest = ChatMessageRequest(
      event: ClientEventChatMessage,
      payload: chatMessagePayload,
    );
    socket.sink.add(chatMessageRequest.toRawJson());
  }

  void listJoinableGames() {
    final listJoinableGamesRequest =
        ListJoinableGamesRequest(event: ClientEventListJoinableGames);
    socket.sink.add(listJoinableGamesRequest.toRawJson());
  }

  void startGame(String gameId) {
    final startGamePayload = StartGamePayload(gameId: gameId);
    final startGameRequest = StartGameRequest(
        event: ClientEventStartGame, payload: startGamePayload);
    socket.sink.add(startGameRequest.toRawJson());
  }

  void placeFirstSquare(String gameId, Position coordinates) {
    final firstSquarePayload =
        FirstSquarePayload(gameId: gameId, coordinates: coordinates);
    final firstSquareRequest = FirstSquareRequest(
        event: ClientEventFirstSquare, payload: firstSquarePayload);
    socket.sink.add(firstSquareRequest.toRawJson());
  }

  void removeFirstSquare(String gameId, Position coordinates) {
    final firstSquarePayload =
        FirstSquarePayload(gameId: gameId, coordinates: coordinates);
    final firstSquareRequest = FirstSquareRequest(
        event: ClientEventRemoveFirstSquare, payload: firstSquarePayload);
    socket.sink.add(firstSquareRequest.toRawJson());
  }

  void leaveGame(String gameId) {
    gameService.currentGame.value = null;
    gameService.currentGameId = '';
    gameService.currentGameTimer.value = null;
    gameService.currentGameInfo = null;
    gameService.currentGameInfoInitialized = false;
    gameService.currentGameRoomUserIds.value = [];
    roomService.removeRoom(gameId);
    final leaveGamePayload = StartGamePayload(gameId: gameId);
    final leaveGameRequest = StartGameRequest(
        event: ClientEventLeaveGame, payload: leaveGamePayload);
    socket.sink.add(leaveGameRequest.toRawJson());
  }

  void leaveChatRoom(String roomId) {
    final joinChatRoomPayload = JoinChatRoomPayload(roomId: roomId);
    final joinChatRoomRequest = JoinChatRoomRequest(
        event: ClientEventLeaveRoom, payload: joinChatRoomPayload);
    socket.sink.add(joinChatRoomRequest.toRawJson());
  }

  void startTournament(String tournamentId) {
    final startTournamentPayload =
        StartTournamentPayload(tournamentId: tournamentId);
    final startTournamentRequest = StartTournamentRequest(
        event: ClientEventStartTournament, payload: startTournamentPayload);
    socket.sink.add(startTournamentRequest.toRawJson());
  }

  void playMove(MoveInfo moveInfo) {
    final playMovePayload =
        PlayMovePayload(gameId: gameService.currentGameId, moveInfo: moveInfo);
    final playMoveRequest =
        PlayMoveRequest(event: ClientEventPlayMove, payload: playMovePayload);
    socket.sink.add(playMoveRequest.toRawJson());
  }

  void getIndices() {
    final indicePayload = IndicePayload(gameId: gameService.currentGameId);
    final indiceRequest =
        IndiceRequest(event: ClientEventIndice, payload: indicePayload);
    socket.sink.add(indiceRequest.toRawJson());
  }

  void joinGameAsObserver(String gameId) {
    final joinGameAsObserverPayload = JoinGamePayload(gameId: gameId);
    final joinGameAsObserverRequest = JoinGameAsObserverRequest(
        event: ClientEventJoinAsObservateur,
        payload: joinGameAsObserverPayload);
    socket.sink.add(joinGameAsObserverRequest.toRawJson());
  }

  void joinTournamentFinaleAsObserver() {
    final joinGameAsObserverPayload = JoinGamePayload(
        gameId: gameService.currentTournament.value!.finale!.id);
    final joinGameAsObserverRequest = JoinGameAsObserverRequest(
        event: ClientEventJoinAsObservateur,
        payload: joinGameAsObserverPayload);
    socket.sink.add(joinGameAsObserverRequest.toRawJson());
  }

  void replaceBotByObserver(String gameId, String botId) {
    final payload = ReplaceBotPayload(gameId: gameId, botId: botId);
    final joinGameAsObserverRequest = ReplaceBotByObserverRequest(
        event: ClientEventReplaceBotByObserver, payload: payload);
    socket.sink.add(joinGameAsObserverRequest.toRawJson());
  }
}
