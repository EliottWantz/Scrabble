import 'package:client_leger/widgets/board.dart';
import 'package:client_leger/widgets/board_tile.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';

final easel = List<String>.generate(7, (index) => 'A', growable: false);

List<TileInfo> getTiles() {
  const tileLayout = '''
    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
    .  .  .  .  .  F  L  U  T  T  E  R  .  .  .
    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
  ''';
  return parseTiles(tileLayout).toList();
}


class GameScreen extends StatelessWidget {
  const GameScreen({Key? key}) : super(key: key);
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
              ScrabbleBoard(tiles: getTiles()),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: easel.map((e) => _buildEasel(e)).toList(),
              ),
            ],
          ),
        ),
      ),
    ));
  }

  Widget _buildEasel(String tile) {
    return Draggable<String>(
        data: tile,
        feedback:
            SizedBox(height: 70, width: 70, child: LetterTile(letter: 'A')),
        child: SizedBox(height: 70, width: 70, child: LetterTile(letter: 'A')));
  }
}
