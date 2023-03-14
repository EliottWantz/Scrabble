import 'package:client_leger/controllers/game_controller.dart';
import 'package:client_leger/models/position.dart';
import 'package:client_leger/models/tile.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/utils/inner_shadow.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

const orangeSquareBackground = Color(0xfffd8e73);
const magentaSquareBackground = Color(0xfff01c7a);
const lightBlueSquareBackground = Color(0xff8ecafc);
const darkBlueSquareBackground = Color(0xff1375b0);

final RxBool _isDropped = false.obs;

const letterPointMapping = {
  'A': 1,
  'B': 3,
  'C': 3,
  'D': 2,
  'E': 1,
  'F': 4,
  'G': 2,
  'H': 4,
  'I': 1,
  'J': 8,
  'K': 5,
  'L': 1,
  'M': 3,
  'N': 1,
  'O': 1,
  'P': 3,
  'Q': 10,
  'R': 1,
  'S': 1,
  'T': 1,
  'U': 1,
  'V': 4,
  'W': 4,
  'X': 8,
  'Y': 4,
  'Z': 10,
};

class LetterTile extends StatelessWidget {
  LetterTile({Key? key, required String letter})
      : letter = letter.toUpperCase(),
        super(key: key);

  final String letter;

  double get lockupRightPadding {
    switch (letter) {
      case 'M':
        return 1.5;
      case 'G':
        return 3;
      default:
        return 1;
    }
  }

  double get pointsRightPadding {
    switch (letter) {
      case 'G':
        return 0;
      case 'A':
      case 'M':
        return 1;
      case 'T':
        return 3;
      default:
        return 2;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(1.5),
      child: SizedBox.expand(
        child: InnerShadow(
          offset: const Offset(0, -1.5),
          blurX: 0.8,
          blurY: 1,
          color: Colors.black.withOpacity(.25),
          child: _buildTileContents(),
        ),
      ),
    );
  }

  DecoratedBox _buildTileContents() {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xfffaeac2),
        border: Border.all(
          color: Colors.black.withAlpha(18),
          width: 1.5,
        ),
        borderRadius: BorderRadius.circular(3),
      ),
      child: Padding(
        padding: EdgeInsets.only(
          right: lockupRightPadding + 0.3,
          bottom: 0.8,
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            _buildLetterLabel(),
            _buildPointLabel(),
          ],
        ),
      ),
    );
  }

  Text _buildLetterLabel() {
    return Text(
      letter,
      style: Get.textTheme.button,
    );
  }

  Positioned _buildPointLabel() {
    return Positioned(
      right: pointsRightPadding,
      bottom: 1,
      child: Text(
        '${letterPointMapping[letter]}',
        style: Get.textTheme.button,
      ),
    );
  }
}

class StartingSquare extends Square {
  const StartingSquare({Key? key})
      : super(
          key: key,
          label: '★',
          color: orangeSquareBackground,
          edgeInsetsOverride: const EdgeInsets.only(left: 0.2, bottom: 0.5),
          labelFontSizeOverride: 14,
        );
}

class DoubleLetterSquare extends Square {
  const DoubleLetterSquare({Key? key})
      : super(
          key: key,
          label: 'DL',
          color: lightBlueSquareBackground,
        );
}

class DoubleWordSquare extends Square {
  const DoubleWordSquare({Key? key})
      : super(
          key: key,
          label: 'DW',
          color: orangeSquareBackground,
        );
}

class TripleLetterSquare extends Square {
  const TripleLetterSquare({Key? key})
      : super(
          key: key,
          label: 'TL',
          color: darkBlueSquareBackground,
        );
}

class TripleWordSquare extends Square {
  const TripleWordSquare({Key? key})
      : super(
          key: key,
          label: 'TW',
          color: magentaSquareBackground,
        );
}

class StandardSquare extends Square {
  StandardSquare({Key? key, required this.position})
      : super(
          key: key,
          color: const Color(0xffe7eaef),
        );

  final GameService _gameService = Get.find();

  final Position position;

  // List<String> letters = [];
  // Map<String, String> covers = {};

  Tile currentData = Tile(letter: 0, value: 0);

  @override
  Widget build(BuildContext context) {
    return DragTarget<Tile>(onWillAccept: (data) {
      List<List<String>> positions = [];
      controller.covers.forEach((key, value) => {
        positions.add(key.split('/'))
      });
      for (final coverPosition in positions) {
        if (coverPosition[0] == position.row.toString()
            && coverPosition[1] == position.col.toString()) {
          print('cannot place here');
          return false;
        }
      }
      return _gameService.currentGame.value!.board[position.row][position.col].tile == null;
    }, onAccept: (data) {
      currentData = data;
      _isDropped.value = true;
    }, builder: (
      BuildContext context,
      List<dynamic> accepted,
      List<dynamic> rejected,
    ) {
      if (_isDropped.value) {
        _isDropped.value = false;
        print('has been dropped');
        controller.letters.add(String.fromCharCode(currentData.letter));
        controller.covers['${position.row}/${position.col}'] = String.fromCharCode(currentData.letter);
        return LetterTile(letter: String.fromCharCode(currentData.letter));
        // return LetterTile(letter: 'a');
      } else {
        String currentPosition = '${position.row}/${position.col}';
        if (controller.covers[currentPosition] != null) {
          return LetterTile(letter: controller.covers[currentPosition]!);
        }
        return Padding(
          padding: const EdgeInsets.all(3.0),
          child: InnerShadow(
            offset: const Offset(0, 0.5),
            blurX: 0.8,
            blurY: 0.7,
            color: Colors.black.withOpacity(.25),
            child: SizedBox.expand(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: const BorderRadius.all(Radius.elliptical(6, 4)),
                ),
                child: _buildLabel(context),
              ),
            ),
          ),
        );
      }
    });
  }
}

class Square extends GetView<GameController> {
  const Square({
    Key? key,
    required this.color,
    this.label,
    this.labelFontSizeOverride,
    this.edgeInsetsOverride,
  }) : super(key: key);

  final Color color;
  final String? label;
  final double? labelFontSizeOverride;
  final EdgeInsets? edgeInsetsOverride;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(3.0),
      child: InnerShadow(
        offset: const Offset(0, 0.5),
        blurX: 0.8,
        blurY: 0.7,
        color: Colors.black.withOpacity(.25),
        child: SizedBox.expand(
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: color,
              borderRadius: const BorderRadius.all(Radius.elliptical(6, 4)),
            ),
            child: _buildLabel(context),
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(BuildContext context) {
    final label = this.label;
    if (label == null) return const SizedBox();

    return Center(
      child: Padding(
        padding:
            edgeInsetsOverride ?? const EdgeInsets.only(top: 1.0, left: 0.5),
        child: Text(
          label,
        ),
      ),
    );
  }
}
