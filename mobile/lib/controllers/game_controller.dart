import 'package:client_leger/models/move_info.dart';
import 'package:client_leger/models/move_types.dart';
import 'package:client_leger/models/square.dart';
import 'package:client_leger/models/tile.dart';
import 'package:client_leger/models/tile_info.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:client_leger/widgets/board_tile.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:get/get_state_manager/src/simple/get_controllers.dart';
import 'package:get_storage/get_storage.dart';

class GameController extends GetxController {
  GameController();

  final WebsocketService websocketService = Get.find();
  final GameService gameService = Get.find();
  final UserService userService = Get.find();

  RxList<TileInfo> lettersPlaced = <TileInfo>[].obs;
  RxBool placeIndiceIsCalled = false.obs;
  RxMap<int, String> lettersToExchange = <int, String>{}.obs;

  bool isClientTurn() {
    return gameService.currentGame.value!.turn == userService.user.value!.id;
  }

  void onLeaveGame() {
    websocketService.leaveGame(gameService.currentGameId);
    Get.offAllNamed(Routes.HOME);
  }

  void exchangeLetters() {
    if (!isClientTurn()) {
      return;
    }

    if (lettersToExchange.isEmpty) {
      return;
    }

    final moveInfo = MoveInfo(
      type: MoveTypeExchange,
      letters: lettersToExchange.values.toList().join(),
      covers: {'': ''},
    );

    websocketService.playMove(moveInfo);
    lettersPlaced.value = [];
    lettersToExchange.value = {};
    gameService.indices.value = [];
  }

  void skipTurn() {
    if (!isClientTurn()) {
      return;
    }
    final moveInfo = MoveInfo(
      type: MoveTypePass,
      letters: '',
      covers: {'': ''},
    );
    websocketService.playMove(moveInfo);
    lettersPlaced.value = [];
    lettersToExchange.value = {};
    gameService.indices.value = [];
  }

  void placeLetters() {
    if (!isClientTurn()) {
      return;
    }
    if (lettersPlaced.isEmpty) {
      return;
    }

    final moveInfo = MoveInfo(
        type: MoveTypePlayTile,
        letters: generateLetters(),
        covers: generateCovers());

    websocketService.playMove(moveInfo);
    lettersPlaced.value = [];
    lettersToExchange.value = {};
    gameService.indices.value = [];
  }

  void placeIndice(MoveInfo moveInfo) {
    if (!isClientTurn()) {
      return;
    }

    websocketService.playMove(moveInfo);
    lettersPlaced.value = [];
    lettersToExchange.value = {};
    gameService.indices.value = [];
  }

  void getIndices() {
    if (!isClientTurn()) {
      return;
    }

    websocketService.getIndices();
  }

  String generateLetters() {
    List<Tile> tilesPlaced = lettersPlaced.map((tile) => tile.tile).toList();
    return tilesPlaced.map((tile) => String.fromCharCode(tile.letter)).join();
  }

  Map<String, String> generateCovers() {
    Map<String, String> covers = {};
    for (var tile in lettersPlaced) {
      String mapKey = '${tile.position.row - 1}/${tile.position.col - 1}';
      String mapValue = String.fromCharCode(tile.tile.letter);
      covers[mapKey] = mapValue;
    }
    return covers;
  }

  bool isTileInBoard(Tile tile) {
    List<Tile> tilesPlaced = lettersPlaced.map((tile) => tile.tile).toList();
    return tilesPlaced.contains(tile);
  }

  Widget getEaselChildToDisplay(Tile tile, int index) {
    if (!isClientTurn()) {
      return SizedBox(
          height: 70,
          width: 70,
          child: LetterTile(
            isEasel: true,
            tile: tile,
          ));
    } else if (isTileInBoard(tile)) {
      return SizedBox(
          height: 70,
          width: 70,
          child: LetterTileDark(
            tile: tile,
          ));
    }
    return DragTarget<Tile>(builder: (
      BuildContext context,
      List<dynamic> accepted,
      List<dynamic> rejected,
    ) {
      return Draggable<Tile>(
          data: tile,
          feedback: SizedBox(
              height: 70,
              width: 70,
              child: LetterTile(
                tile: tile,
                isEasel: true,
                isEaselPlaced: true,
              )),
          child: GestureDetector(
              onTap: () {
                if (!lettersToExchange.containsKey(index)) {
                  lettersToExchange[index] = String.fromCharCode(tile.letter);
                } else {
                  lettersToExchange.remove(index);
                }
              },
              child: Obx(() => Container(
                    decoration: lettersToExchange.containsKey(index)
                        ? BoxDecoration(
                            border: Border.all(color: Colors.blueAccent))
                        : null,
                    child: SizedBox(
                        height: 70,
                        width: 70,
                        child: LetterTile(
                          tile: tile,
                          isEasel: true,
                        )),
                  ))));
    });
  }
}