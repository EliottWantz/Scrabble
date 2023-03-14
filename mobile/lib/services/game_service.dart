import 'package:client_leger/models/game_room.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:get/get.dart';

import '../models/game_update_payload.dart';
import '../models/player.dart';
import '../models/room.dart';

class GameService extends GetxService {
  final UserService userService = Get.find();

  final joinableGames = Rxn<List<GameRoom>>();

  final currentGameRoom = Rxn<Room>();
  // final currentGameRoomUsers = Rxn<List<User>>();
  final currentGameRoomUsers = <User>[].obs;

  final currentGame = Rxn<GameUpdatePayload>();

  Player? getPlayer() {
    for (final player in currentGame.value!.players) {
      if (player.id == userService.user.value!.id) return player;
    }
  }
  bool isCurrentPlayer(String playerId) {
    return currentGame.value!.turn == playerId;
  }
  // final currentGameTimer = Rxn<
}
