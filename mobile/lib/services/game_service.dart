import 'package:client_leger/models/game_room.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:get/get.dart';

import '../models/chat_message_payload.dart';
import '../models/game.dart';
import '../models/game_update_payload.dart';
import '../models/move_info.dart';
import '../models/player.dart';
import '../models/room.dart';

class GameService extends GetxService {
  final UserService userService = Get.find();

  final joinableGames = Rxn<List<Game>>();

  // final currentGameRoom = Rxn<Room>();
  late String currentGameId;
  final currentRoomMessages = <ChatMessagePayload>[].obs;
  // final currentGameRoomUsers = Rxn<List<User>>();
  final currentGameRoomUserIds = <String>[].obs;

  final currentGame = Rxn<GameUpdatePayload>();
  final currentGameTimer = Rxn<int>();
  late Game currentGameInfo;

  RxList<MoveInfo> indices = <MoveInfo>[].obs;

  Player? getPlayer() {
    for (final player in currentGame.value!.players) {
      if (player.id == userService.user.value!.id) return player;
    }
    return null;
  }

  bool isMyTurn() {
    return currentGame.value!.turn == userService.user.value!.id;
  }

  bool isCurrentPlayer(String playerId) {
    return currentGame.value!.turn == playerId;
  }

  bool isCurrentGameId(String roomId) {
    return currentGameId == roomId;
  }

  bool isGameCreator() {
    return currentGameInfo.creatorId == userService.user.value!.id;
  }

  Game? getJoinableGameById(String id) {
    for (final game in joinableGames.value!) {
      if (game.id == id) {
        return game;
      }
    }
    return null;
  }
}
