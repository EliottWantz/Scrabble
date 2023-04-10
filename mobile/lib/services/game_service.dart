import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/models/game_room.dart';
import 'package:client_leger/models/rack.dart';
import 'package:client_leger/models/requests/accept_join_game_request.dart';
import 'package:client_leger/models/tournament.dart';
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
  final ApiRepository apiRepository = Get.find();

  final joinableGames = Rxn<List<Game>>();
  final observableGames = Rxn<List<Game>>();

  final joinableTournaments = Rxn<List<Tournament>>();

  late String currentGameId;
  late String currentTournamentId;
  final currentRoomMessages = <ChatMessagePayload>[].obs;

  final currentGameRoomUserIds = <String>[].obs;
  final currentGameRoomObserverIds = <String>[].obs;

  final currentTournamentUserIds = <String>[].obs;

  //Private game
  final pendingJoinGameRequestUserIds = <String>[].obs;
  final pendingJoinTournamentRequestUserIds = <String>[].obs;

  final sentGameInvitesUsernames = <String>[].obs;

  final currentGame = Rxn<GameUpdatePayload>();
  final currentGameTimer = Rxn<int>();
  late Game? currentGameInfo;
  late Tournament? currentTournamentInfo;

  RxList<MoveInfo> indices = <MoveInfo>[].obs;
  bool getIndicesHasBeenCalled = false;

  final RxBool gameInviteSent = false.obs;

  Player? getPlayer() {
    for (final player in currentGame.value!.players) {
      if (player.id == userService.user.value!.id) return player;
    }
    return null;
  }

  Rack? getPlayerRackById(String id) {
    for (final player in currentGame.value!.players) {
      if (id == player.id) return player.rack;
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
    String creatorId = currentGameInfo!.creatorId.split("#")[0];
    return creatorId == userService.user.value!.id;
  }

  bool isGameObserver() {
    for (final obervateurId in currentGameInfo!.observateurIds) {

    }
    String creatorId = currentGameInfo!.creatorId.split("#")[0];
    return creatorId == userService.user.value!.id;
  }

  Game? getJoinableGameById(String gameId) {
    for (final game in joinableGames.value!) {
      if (game.id == gameId) {
        return game;
      }
    }
    return null;
  }

  Tournament? getJoinableTournamentById(String tournamentId) {
    for (final tournament in joinableTournaments.value!) {
      if (tournament.id == tournamentId) {
        return tournament;
      }
    }
  }

  Future<bool?> acceptJoinGameRequest(String userId) async {
    final request = AcceptJoinGameRequest(userId: userId, gameId: currentGameId);
    final res = await apiRepository.acceptJoinGameRequest(request);
    if (res == true) {
      return true;
    }
    return null;
  }

  Future<bool?> declineJoinGameRequest(String userId) async {
    final request = AcceptJoinGameRequest(userId: userId, gameId: currentGameId);
    final res = await apiRepository.declineJoinGameRequest(request);
    if (res == true) {
      return true;
    }
    return null;
  }

  Future<bool?> revokeJoinGameRequest(String gameId) async {
    final request = AcceptJoinGameRequest(userId: userService.user.value!.id, gameId: gameId);
    final res = await apiRepository.revokeJoinGameRequest(request);
    if (res == true) {
      return true;
    }
    return null;
  }
}
