import 'package:client_leger/controllers/game_controller.dart';
import 'package:client_leger/models/tile.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/widgets/board.dart';
import 'package:client_leger/widgets/board_tile.dart';
import 'package:client_leger/widgets/game_chat.dart';
import 'package:client_leger/widgets/timer.dart';
import 'package:flutter/material.dart';
import 'package:flutter_layout_grid/flutter_layout_grid.dart';
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
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(
          Icons.question_answer_rounded,
        ),
      ),
      body: SingleChildScrollView(
        child: LayoutGrid(
          areas: '''
          leave  content  settings
          nav    content  aside
          nav    easel  aside
          nav    easel  chat
        ''',
          rowGap: 7,
          columnSizes: [1.fr, 2.fr, 1.fr],
          rowSizes: [
            40.px,
            auto,
            auto,
            50.px,
          ],
          children: [
            Center(
              child: Padding(
                padding: EdgeInsets.only(top: 5),
                child: ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(
                    Icons.exit_to_app_rounded,
                    size: 20,
                  ),
                  label: const Text('Quitter la partie'), // <-- Text
                ),
              ),
            ).inGridArea('leave'),
            Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: EdgeInsets.only(top: 5),
                child: IconButton(
                  onPressed: () {},
                  icon: const Icon(
                    Icons.settings,
                    size: 30,
                  ), // <-- Text
                ),
              ).inGridArea('settings'),
            ),
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Timer(time: 600),
                  Gap(100),
                  Container(
                    padding: EdgeInsets.all(5),
                    decoration: BoxDecoration(
                        border: Border.all(width: 5),
                        borderRadius: BorderRadius.circular(12)),
                    child: Text(
                      'Lettres en réserve \n 80',
                      textAlign: TextAlign.center,
                      style: Get.context!.textTheme.headline6,
                    ),
                  ),
                  Gap(100),
                  ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(
                      Icons.lightbulb,
                      size: 30,
                    ),
                    label: const Text('Indices'),
                  ),
                ],
              ),
            ).inGridArea('aside'),
            Obx(() => Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: _buildPlayersInfo(),
                  ),
                )).inGridArea('nav'),
            ScrabbleBoard().inGridArea('content'),
            Obx(() => Column(
              mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: _gameService
                            .getPlayer()!
                            .rack
                            .tiles
                            .map((e) => _buildEasel(e))
                            .toList()),
                    Gap(10),
                    !controller.isClientTurn()
                        ? Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              ElevatedButton.icon(
                                onPressed: () {
                                  controller.placeLetters();
                                },
                                icon: const Icon(
                                  Icons.check,
                                  size: 20,
                                ),
                                label: const Text('Placer'),
                              ),
                              const Gap(20),
                              ElevatedButton.icon(
                                onPressed: () {
                                  controller.skipTurn();
                                },
                                icon: const Icon(
                                  Icons.double_arrow,
                                  size: 20,
                                ),
                                label: const Text('Passer'), // <-- Text
                              ),
                              const Gap(20),
                              ElevatedButton.icon(
                                onPressed: () {
                                  controller.exchangeLetters();
                                },
                                icon: const Icon(
                                  Icons.change_circle,
                                  size: 20,
                                ),
                                label: const Text('Échanger'), // <-- Text
                              ),
                            ],
                          )
                        : const SizedBox(),
                  ],
                )).inGridArea('easel'),
          ],
        ),
      ),
    );
  }

  Widget _buildEasel(Tile tile) {
    return controller.getEaselChildToDisplay(tile);
  }

  List<Widget> _buildPlayersInfo() {
    List<Widget> playerInfoPanels = [];
    for (final player in _gameService.currentGame.value!.players) {
      playerInfoPanels.add(const Gap(20));
      playerInfoPanels.add(PlayerInfo(
          playerName: player.username,
          isPlayerTurn: _gameService.isCurrentPlayer(player.id),
          score: player.score,
          isBot: player.isBot));
      playerInfoPanels.add(const Gap(20));
    }
    playerInfoPanels.add(const Gap(20));
    return playerInfoPanels;
  }
}
