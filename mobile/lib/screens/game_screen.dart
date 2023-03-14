import 'package:client_leger/models/tile.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/widgets/board.dart';
import 'package:client_leger/widgets/board_tile.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

class GameScreen extends StatelessWidget {
  GameScreen({Key? key}) : super(key: key);
  final GameService _gameService = Get.find();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: SafeArea(
      child: Center(
        child: SizedBox(
          width: 600,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              const Gap(20),
              ScrabbleBoard(),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: _gameService
                    .getPlayer()!
                    .rack
                    .tiles
                    .map((e) => _buildEasel(e))
                    .toList(),
              ),
            ],
          ),
        ),
      ),
    ));
  }

  Widget _buildEasel(Tile tile) {
    return Draggable<Tile>(
        data: tile,
        feedback: SizedBox(
            height: 70,
            width: 70,
            child: LetterTile(letter: String.fromCharCode(tile.letter))),
        child: SizedBox(
            height: 70,
            width: 70,
            child: LetterTile(letter: String.fromCharCode(tile.letter))));
  }
}
