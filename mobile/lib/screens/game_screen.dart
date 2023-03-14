import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/widgets/board.dart';
import 'package:client_leger/widgets/board_tile.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

import '../widgets/player_info.dart';

final easel = List<String>.generate(7, (index) => 'A', growable: false);


class GameScreen extends StatelessWidget {
  final GameService _gameService = Get.find();

  GameScreen({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: SafeArea(
        child: Center(
          child: Row(
            children: [
              Column(
                children: _buildPlayersInfo(),
              ),
              Center(
                  child: SizedBox(
                    width: 600,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        const Gap(20),
                        ScrabbleBoard(),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: easel.map((e) => _buildEasel(e)).toList(),
                        ),
                      ],
                    ),
                  )
              ),
            ],
        ))
      ),
    );
  }

  Widget _buildEasel(String tile) {
    return Draggable<String>(
        data: tile,
        feedback:
            SizedBox(height: 70, width: 70, child: LetterTile(letter: 'A')),
        child: SizedBox(height: 70, width: 70, child: LetterTile(letter: 'A')));
  }

  List<Widget> _buildPlayersInfo() {
    List<Widget> playerInfoPanels = [];
    for (final player in _gameService.currentGame.value!.players) {
      playerInfoPanels.add(PlayerInfo(
        playerName: player.username,
        isPlayerTurn: _gameService.isCurrentPlayer(player.id),
        score: player.score,
        isBot: player.isBot
      ));
      playerInfoPanels.add(Gap(20));
    }
    return playerInfoPanels;
  }
}
