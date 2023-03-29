import 'package:client_leger/controllers/game_controller.dart';
import 'package:client_leger/models/position.dart';
import 'package:client_leger/models/tile.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/utils/constants/board.dart';
import 'package:client_leger/widgets/board_tile.dart';
import 'package:flutter/material.dart';
import 'package:flutter_layout_grid/flutter_layout_grid.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';

const trackCount = 16;
const doubleLetterCount = 24;
const List<List<int>> DLPositions = [
  [1, 4],
  [1, 12],
  [3, 7],
  [3, 9],
  [4, 1],
  [4, 8],
  [4, 15],
  [7, 3],
  [7, 7],
  [7, 9],
  [7, 13],
  [8, 4],
  [8, 12],
  [9, 3],
  [9, 7],
  [9, 9],
  [9, 13],
  [12, 1],
  [12, 8],
  [12, 15],
  [13, 7],
  [13, 9],
  [15, 4],
  [15, 12],
];
const doubleWordCount = 16;
const List<List<int>> DWPositions = [
  [2, 2],
  [2, 14],
  [3, 3],
  [3, 13],
  [4, 4],
  [4, 12],
  [5, 5],
  [5, 11],
  [11, 5],
  [11, 11],
  [12, 4],
  [12, 12],
  [13, 3],
  [13, 13],
  [14, 2],
  [14, 14]
];
const tripleLetterCount = 12;
const List<List<int>> TLPositions = [
  [2, 6],
  [2, 10],
  [6, 2],
  [6, 6],
  [6, 10],
  [6, 14],
  [10, 2],
  [10, 6],
  [10, 10],
  [10, 14],
  [14, 6],
  [14, 10]
];
const tripleWordCount = 8;
const List<List<int>> TWPositions = [
  [1, 1],
  [1, 8],
  [1, 15],
  [8, 1],
  [8, 15],
  [15, 1],
  [15, 8],
  [15, 15]
];
const tileCount = trackCount * trackCount;

const letterPointMapping = {
  // row,col
  '01': 'A',
  '02': 'B',
  '03': 'C',
  '04': 'D',
  '05': 'E',
  '06': 'F',
  '07': 'G',
  '08': 'H',
  '09': 'I',
  '010': 'J',
  '011': 'K',
  '012': 'L',
  '013': 'M',
  '014': 'N',
  '015': 'O',
  '10': '1',
  '20': '2',
  '30': '3',
  '40': '4',
  '50': '5',
  '60': '6',
  '70': '7',
  '80': '8',
  '90': '9',
  '100': '10',
  '110': '11',
  '120': '12',
  '130': '13',
  '140': '14',
  '150': '15',
};

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
            for (int i = 0; i < trackCount; i++)
              for (int j = 0; j < trackCount; j++)
                if (letterPointMapping.containsKey(i.toString() + j.toString()))
                  Center(
                          child: Text(
                              letterPointMapping[i.toString() + j.toString()]!))
                      .inGridArea(
                          letterPointMapping[i.toString() + j.toString()]!),
            for (int i = 1; i < trackCount; i++)
              for (int j = 1; j < trackCount; j++)
                gameService.currentGame.value!.board[i - 1][j - 1].tile == null
                    ? StandardSquare(position: Position(row: i, col: j))
                        .withGridPlacement(columnStart: j, rowStart: i)
                    : LetterTile(
                            tile: gameService.currentGame.value!
                                .board[i - 1][j - 1].tile as Tile,isEasel: false,)
                        .withGridPlacement(columnStart: j, rowStart: i),
            if (gameService.currentGame.value!.board[7][7].tile == null)
              StartingSquare(position: Position(row: 8, col: 8))
                  .inGridArea('★'),
            for (int i = 0; i < doubleLetterCount; i++)
              if (gameService
                      .currentGame
                      .value!
                      .board[DLPositions[i][0] - 1][DLPositions[i][1] - 1]
                      .tile ==
                  null)
                DoubleLetterSquare(
                        position: Position(
                            row: DLPositions[i][0], col: DLPositions[i][1]))
                    .inGridArea('dl${i.toRadixString(36)}'),
            for (int i = 0; i < doubleWordCount; i++)
              if (gameService
                      .currentGame
                      .value!
                      .board[DWPositions[i][0] - 1][DWPositions[i][1] - 1]
                      .tile ==
                  null)
                DoubleWordSquare(
                        position: Position(
                            row: DWPositions[i][0], col: DWPositions[i][1]))
                    .inGridArea('dw${i.toRadixString(36)}'),
            for (int i = 0; i < tripleLetterCount; i++)
              if (gameService
                      .currentGame
                      .value!
                      .board[TLPositions[i][0] - 1][TLPositions[i][1] - 1]
                      .tile ==
                  null)
                TripleLetterSquare(
                        position: Position(
                            row: TLPositions[i][0], col: TLPositions[i][1]))
                    .inGridArea('tl${i.toRadixString(36)}'),
            for (int i = 0; i < tripleWordCount; i++)
              if (gameService
                      .currentGame
                      .value!
                      .board[TWPositions[i][0] - 1][TWPositions[i][1] - 1]
                      .tile ==
                  null)
                TripleWordSquare(
                        position: Position(
                            row: TWPositions[i][0], col: TWPositions[i][1]))
                    .inGridArea('tw${i.toRadixString(36)}'),
            for (final tile in controller.lettersPlaced)
              Draggable<Tile>(
                  data: tile.tile,
                  onDragStarted: () => controller.lettersPlaced.remove(tile),
                  feedback: SizedBox(
                      height: 70,
                      width: 70,
                      child: LetterTile(
                        tile: tile.tile,
                        isEasel: false,
                        isEaselPlaced: true,
                      )),
                  child: SizedBox(
                      height: 70,
                      width: 70,
                      child: LetterTile(
                        tile: tile.tile,
                        isEasel: false,
                      ))).withGridPlacement(
                columnStart: tile.position.col,
                rowStart: tile.position.row,
              ),
          ],
        ));
  }
}
