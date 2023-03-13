import 'dart:convert';

import 'package:client_leger/utils/constants/board.dart';
import 'package:client_leger/widgets/board_tile.dart';
import 'package:flutter/material.dart';
import 'package:flutter_layout_grid/flutter_layout_grid.dart';

const trackCount = 15;
const doubleLetterCount = 24;
const doubleWordCount = 16;
const tripleLetterCount = 12;
const tripleWordCount = 8;
const tileCount = trackCount * trackCount;

class ScrabbleBoard extends StatelessWidget {
  const ScrabbleBoard({
    Key? key,
    required this.tiles,
  }) : super(key: key);

  final List<TileInfo> tiles;

  @override
  Widget build(BuildContext context) {
    return LayoutGrid(
      areas: BoardConstants.boardArea,
      columnSizes: repeat(trackCount, [40.px]),
      rowSizes: repeat(trackCount, [40.px]),
      children: [
        // First, square bases
        for (int i = 0; i < trackCount; i++)
          for (int j = 0; j < trackCount; j++)
            const StandardSquare()
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
        for (final tile in tiles)
          LetterTile(letter: tile.letter).withGridPlacement(
            columnStart: tile.col,
            rowStart: tile.row,
          ),
      ],
    );
  }
}

class TileInfo {
  TileInfo(this.letter, this.col, this.row)
      : points = letterPointMapping[letter]!;

  final String letter;
  final int col;
  final int row;
  final int points;

  @override
  String toString() => '$letter@($col, $row)=$points';
}

Iterable<TileInfo> parseTiles(String tileLayout) sync* {
  final rows = LineSplitter.split(tileLayout)
      .map((row) => row.trim())
      .where((row) => row.isNotEmpty)
      .toList();
  for (int i = 0; i < rows.length; i++) {
    final row = rows[i];
    final columns = row.split(RegExp(r'\s+'));
    for (int j = 0; j < columns.length; j++) {
      final cell = columns[j];
      if (cell == '.') continue;

      yield TileInfo(cell, j, i);
    }
  }
}
