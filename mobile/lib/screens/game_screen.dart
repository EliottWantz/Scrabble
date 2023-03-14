import 'package:client_leger/controllers/game_controller.dart';
import 'package:client_leger/models/tile.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/widgets/board.dart';
import 'package:client_leger/widgets/board_tile.dart';
import 'package:client_leger/widgets/game_chat.dart';
import 'package:client_leger/widgets/timer.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

import '../models/move_info.dart';
import '../models/move_types.dart';
import '../widgets/player_info.dart';


class GameScreen extends GetView<GameController> {
  GameScreen({Key? key}) : super(key: key);
  final GameService _gameService = Get.find();
  final UserService _userService = Get.find();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: SafeArea(
        child: Center(
          child: Row(
            // mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Gap(50),
              Obx(() => Column(
                children: _buildPlayersInfo(),
              )),
              Gap(20),
              Center(
                  child: SizedBox(
                    width: 600,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        const Gap(20),
                        ScrabbleBoard(),
                        Obx(() => Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: _gameService
                              .getPlayer()!
                              .rack
                              .tiles
                              .map((e) => _buildEasel(e))
                              .toList()
                          )),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            ElevatedButton.icon(
                              onPressed: () {
                                if (_gameService.currentGame.value!.turn != _userService.user.value!.id) {
                                  return;
                                }
                                if (controller.letters.isEmpty) {
                                  return;
                                }
                                final moveInfo = MoveInfo(
                                    type: MoveTypePlayTile,
                                    letters: controller.letters.join(),
                                    covers: controller.covers
                                );
                                controller.websocketService.playMove(moveInfo);
                                controller.letters = [];
                                controller.covers = {};
                              },
                              icon: const Icon(
                                // <-- Icon
                                Icons.check,
                                size: 20,
                              ),
                              label: const Text('Placer'), // <-- Text
                              // style:  ButtonStyle(
                              //   backgroundColor: (_gameService.currentGame.value!.turn == _userService.user.value!.id)
                              //       ? const MaterialStatePropertyAll<Color>(Color.fromRGBO(98, 0, 238, 255))
                              //       : const MaterialStatePropertyAll<Color>(Colors.grey),
                              // )
                            ),
                            const Gap(20),
                            ElevatedButton.icon(
                              onPressed: () {
                                if (_gameService.currentGame.value!.turn != _userService.user.value!.id) {
                                  return;
                                }
                                final moveInfo = MoveInfo(
                                    type: MoveTypePass,
                                    letters: controller.letters.join(),
                                    covers: controller.covers
                                );
                                controller.websocketService.playMove(moveInfo);
                                controller.letters = [];
                                controller.covers = {};
                              },
                              icon: const Icon(
                                // <-- Icon
                                Icons.double_arrow,
                                size: 20,
                              ),
                              label: const Text('Passer'), // <-- Text
                            ),
                            const Gap(20),
                            ElevatedButton.icon(
                              onPressed: () {
                                if (_gameService.currentGame.value!.turn != _userService.user.value!.id) {
                                  return;
                                }
                                if (controller.lettersToExchange.isEmpty) {
                                  return;
                                }
                                final moveInfo = MoveInfo(
                                    type: MoveTypeExchange,
                                    letters: controller.lettersToExchange.join(),
                                    covers: controller.covers
                                );
                                controller.websocketService.playMove(moveInfo);
                                controller.letters = [];
                                controller.lettersToExchange.value = [];
                                controller.covers = {};
                              },
                              icon: const Icon(
                                // <-- Icon
                                Icons.change_circle,
                                size: 20,
                              ),
                              label: const Text('Échanger'), // <-- Text
                            ),
                      ],
                    ),
                  ])
              ),
              ),
              GameChat()
            ],
        ))
      ),
    );
  }

  Widget _buildEasel(Tile tile) {
    return Draggable<Tile>(
        data: tile,
        feedback: SizedBox(
            height: 70,
            width: 70,
            child: LetterTile(letter: String.fromCharCode(tile.letter))),
        child: GestureDetector(
          onTap: () {
            if (!controller.lettersToExchange.contains(String.fromCharCode(tile.letter))) {
              controller.lettersToExchange.add(String.fromCharCode(tile.letter));
            } else {
              controller.lettersToExchange.remove(String.fromCharCode(tile.letter));
            }
            print(controller.lettersToExchange.toString());
          },
          child: Container(
            decoration: controller.lettersToExchange.contains(String.fromCharCode(tile.letter))
              ? BoxDecoration(
                  border: Border.all(color: Colors.blueAccent)
                )
            : null,
            child: SizedBox(
                height: 70,
                width: 70,
                child: LetterTile(letter: String.fromCharCode(tile.letter))
            ),
          )
        )
    );
  }

  List<Widget> _buildPlayersInfo() {
    List<Widget> playerInfoPanels = [];
    for (final player in _gameService.currentGame.value!.players) {
      playerInfoPanels.add(Gap(20));
      playerInfoPanels.add(PlayerInfo(
        playerName: player.username,
        isPlayerTurn: _gameService.isCurrentPlayer(player.id),
        score: player.score,
        isBot: player.isBot
      ));
      playerInfoPanels.add(Gap(20));
    }
    playerInfoPanels.add(Timer(time: _gameService.currentGameTimer.value));
    return playerInfoPanels;
  }
}
