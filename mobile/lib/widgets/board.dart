import 'package:client_leger/controllers/game_controller.dart';
import 'package:client_leger/models/position.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/utils/constants/board.dart';
import 'package:client_leger/widgets/board_tile.dart';
import 'package:flutter/material.dart';
import 'package:flutter_layout_grid/flutter_layout_grid.dart';
import 'package:get/get.dart';

const trackCount = 15;
const doubleLetterCount = 24;
const doubleWordCount = 16;
const tripleLetterCount = 12;
const tripleWordCount = 8;
const tileCount = trackCount * trackCount;

class ScrabbleBoard extends GetView<GameController> {
  ScrabbleBoard({
    Key? key,
  }) : super(key: key);

  final GameService gameService = Get.find();

  @override
  Widget build(BuildContext context) {
    return Obx(() => LayoutGrid(
          areas: BoardConstants.boardArea,
          columnSizes: repeat(trackCount, [40.px]),
          rowSizes: repeat(trackCount, [40.px]),
          children: [
            // First, square bases
            for (int i = 0; i < trackCount; i++)
              for (int j = 0; j < trackCount; j++)
                // if (gameService.currentGame.value!.board[i][j].tile == null)
                  StandardSquare(position: Position(row: i, col: j))
                      .withGridPlacement(columnStart: i, rowStart: j),
            // Then put bonuses on top
            const StartingSquare().inGridArea('★'),
            for (int i = 0; i < doubleLetterCount; i++)
              const DoubleLetterSquare().inGridArea('dl${i.toRadixString(36)}'),
            for (int i = 0; i < doubleWordCount; i++)
              const DoubleWordSquare().inGridArea('dw${i.toRadixString(36)}'),
            for (int i = 0; i < tripleLetterCount; i++)
              const TripleLetterSquare().inGridArea('tl${i.toRadixString(36)}'),
            for (int i = 0; i < tripleWordCount; i++)
              const TripleWordSquare().inGridArea('tw${i.toRadixString(36)}'),

            // Then place tiles on top of those
            for (final row in gameService.currentGame.value!.board)
              for (final square in row)
                if (square.tile != null)
                  LetterTile(letter: String.fromCharCode(square.tile!.letter))
                      .withGridPlacement(
                    columnStart: square.position.col,
                    rowStart: square.position.row,
                  )
          ],
        ));
  }
}
