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
const List<List<int>> DLPositions = [
  [0, 3],
  [0, 1],
  [2, 6],
  [2, 8],
  [3, 0],
  [3, 7],
  [3, 14],
  [6, 2],
  [6, 6],
  [6, 8],
  [6, 1],
  [7, 3],
  [7, 1],
  [8, 2],
  [8, 6],
  [8, 8],
  [8, 12],
  [11, 0],
  [11, 7],
  [11, 14],
  [12, 6],
  [12, 8],
  [14, 3],
  [14, 11],
];
const doubleWordCount = 16;
const List<List<int>> DWPositions = [
  [1, 1],
  [1, 13],
  [2, 2],
  [2, 12],
  [3, 3],
  [3, 11],
  [4, 4],
  [4, 10],
  [10, 4],
  [10, 10],
  [11, 3],
  [11, 11],
  [12, 2],
  [12, 12],
  [13, 1],
  [13, 13]
];
const tripleLetterCount = 12;
const List<List<int>> TLPositions = [
  [1, 5],
  [1, 9],
  [5, 1],
  [5, 5],
  [5, 9],
  [5, 13],
  [9, 1],
  [9, 5],
  [9, 9],
  [9, 13],
  [13, 5],
  [13, 9]
];
const tripleWordCount = 8;
const List<List<int>> TWPositions = [
  [0, 0],
  [0, 7],
  [0, 14],
  [7, 0],
  [7, 14],
  [14, 0],
  [14, 7],
  [14, 14]
];
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
            StartingSquare(position: Position(row: 7, col: 7)).inGridArea('★'),
            for (int i = 0; i < doubleLetterCount; i++)
              DoubleLetterSquare(
                position: Position(row: DLPositions[i][0], col: DLPositions[i][1]))
                  .inGridArea('dl${i.toRadixString(36)}'),
            for (int i = 0; i < doubleWordCount; i++)
              DoubleWordSquare(
                  position: Position(row: DWPositions[i][0], col: DWPositions[i][1]))
                    .inGridArea('dw${i.toRadixString(36)}'),
            for (int i = 0; i < tripleLetterCount; i++)
              TripleLetterSquare(
                  position: Position(row: TLPositions[i][0], col: TLPositions[i][1]))
                  .inGridArea('tl${i.toRadixString(36)}'),
            for (int i = 0; i < tripleWordCount; i++)
              TripleWordSquare(
                  position: Position(row: TWPositions[i][0], col: TWPositions[i][1]))
                  .inGridArea('tw${i.toRadixString(36)}'),

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
