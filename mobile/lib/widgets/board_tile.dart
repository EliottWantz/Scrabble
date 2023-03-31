import 'dart:convert';

import 'package:client_leger/controllers/game_controller.dart';
import 'package:client_leger/models/position.dart';
import 'package:client_leger/models/tile.dart';
import 'package:client_leger/models/tile_info.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/utils/inner_shadow.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

const orangeSquareBackground = Color(0xfffd8e73);
const magentaSquareBackground = Color(0xfff01c7a);
const lightBlueSquareBackground = Color(0xff8ecafc);
const darkBlueSquareBackground = Color(0xff1375b0);

class LetterTileDark extends StatelessWidget {
  const LetterTileDark({Key? key, required this.tile}) : super(key: key);

  final Tile tile;

  double get lockupRightPadding {
    switch (String.fromCharCode(tile.letter).toUpperCase()) {
      case 'M':
        return 1.5;
      case 'G':
        return 3;
      default:
        return 1;
    }
  }

  double get pointsRightPadding {
    switch (String.fromCharCode(tile.letter).toUpperCase()) {
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
        child: _buildTileContents(),
      ),
    );
  }

  DecoratedBox _buildTileContents() {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.grey.shade600,
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
      String.fromCharCode(tile.letter).toUpperCase(),
      style: Get.textTheme.button,
    );
  }

  Positioned _buildPointLabel() {
    return Positioned(
      right: pointsRightPadding,
      bottom: 1,
      child: Text(
        '${tile.value}',
        style: Get.textTheme.button,
      ),
    );
  }
}

class LetterTile extends StatelessWidget {
  const LetterTile(
      {Key? key, required this.tile, required this.isEasel, this.isEaselPlaced})
      : super(key: key);

  final Tile tile;
  final bool isEasel;
  final bool? isEaselPlaced;

  double get lockupRightPadding {
    switch (String.fromCharCode(tile.letter).toUpperCase()) {
      case 'M':
        return 1.5;
      case 'G':
        return 3;
      default:
        return 2;
    }
  }

  double get pointsRightPadding {
    switch (String.fromCharCode(tile.letter).toUpperCase()) {
      case 'G':
        return 0;
      case 'A':
      case 'M':
        return 1;
      case 'T':
        return 3;
      case 'K':
      default:
        return 2;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(3),
      child: SizedBox.expand(
        child: _buildTileContents(),
      ),
    );
  }

  DecoratedBox _buildTileContents() {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: isEaselPlaced != null
            ? const Color.fromRGBO(250, 234, 194, 0.8)
            : const Color(0xfffaeac2),
        border: Border.all(
          color: Colors.black.withAlpha(18),
          width: 1.5,
        ),
        borderRadius: BorderRadius.circular(3),
      ),
      child: Padding(
        padding: EdgeInsets.only(
          right: lockupRightPadding + 0.4,
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
    if (isEasel == true && tile.isSpecial == true) {
      tile.letter = 42;
    }

    return Text(String.fromCharCode(tile.letter).toUpperCase(),
        style: Get.textTheme.button!.copyWith(color: Colors.black));
  }

  Positioned _buildPointLabel() {
    return Positioned(
      right: pointsRightPadding,
      bottom: 1,
      child: Text(
        '${tile.value}',
        style: Get.textTheme.button!.copyWith(
            color: Colors.black,
            fontSize: isEasel ? 15 : 9,
            fontWeight: FontWeight.normal),
      ),
    );
  }
}

class StartingSquare extends Square {
  const StartingSquare({Key? key, required Position position})
      : super(
            key: key,
            label: '★',
            color: orangeSquareBackground,
            edgeInsetsOverride: const EdgeInsets.only(left: 0.2, bottom: 0.5),
            labelFontSizeOverride: 14,
            position: position);
}

class DoubleLetterSquare extends Square {
  const DoubleLetterSquare({Key? key, required Position position})
      : super(
            key: key,
            label: 'DL',
            color: lightBlueSquareBackground,
            position: position);
}

class DoubleWordSquare extends Square {
  const DoubleWordSquare({Key? key, required Position position})
      : super(
            key: key,
            label: 'DW',
            color: orangeSquareBackground,
            position: position);
}

class TripleLetterSquare extends Square {
  const TripleLetterSquare({Key? key, required Position position})
      : super(
            key: key,
            label: 'TL',
            color: darkBlueSquareBackground,
            position: position);
}

class TripleWordSquare extends Square {
  const TripleWordSquare({Key? key, required Position position})
      : super(
            key: key,
            label: 'TW',
            color: magentaSquareBackground,
            position: position);
}

class StandardSquare extends Square {
  const StandardSquare({Key? key, required Position position})
      : super(key: key, color: const Color(0xffe7eaef), position: position);
}

class Square extends GetView<GameController> {
  const Square({
    Key? key,
    required this.color,
    required this.position,
    this.label,
    this.labelFontSizeOverride,
    this.edgeInsetsOverride,
  }) : super(key: key);

  final Color color;
  final Position position;
  final String? label;
  final double? labelFontSizeOverride;
  final EdgeInsets? edgeInsetsOverride;

  @override
  Widget build(BuildContext context) {
    return DragTarget<Tile>(onAccept: (data) {
      if (data.isSpecial == true) {
        Get.bottomSheet(
          SizedBox(
            height: 65,
            width: 200,
            child: Form(
              key: controller.dropdownFormKey,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    height: 60,
                    width: 200,
                    child: DropdownButtonFormField<String>(
                      menuMaxHeight: 150,
                      alignment: AlignmentDirectional.bottomCenter,
                      hint: Text('Choisissez une lettre',style: Get.textTheme.button,),
                      decoration: InputDecoration(
                        enabledBorder: OutlineInputBorder(
                          borderSide: const BorderSide(
                              color: Colors.blue, width: 2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        border: OutlineInputBorder(
                          borderSide: const BorderSide(
                              color: Colors.blue, width: 2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        filled: true,
                        fillColor: Get.theme.primaryColor,
                      ),
                      validator: (value) =>
                          value == null ? "Choisissez une lettre" : null,
                      dropdownColor: Get.theme.primaryColor,
                      onChanged: (String? value) {
                        controller.currentSpecialLetter.value = value!;
                        data.letter = ascii
                            .encode(controller.currentSpecialLetter.value)
                            .first;
                        controller.lettersPlaced.add(
                            TileInfo(tile: data, position: position));
                      },
                      items: List<String>.generate(26,
                              (index) => String.fromCharCode(index + 65))
                          .map((e) =>
                              DropdownMenuItem(value: e, child: Text(e)))
                          .toList(),
                    ),
                  ),
                  const Gap(20),
                  ElevatedButton.icon(
                      onPressed: () {
                        Get.back();
                      },
                      icon: const Icon(Icons.check),
                      label: const Text('Confirmer'))
                ],
              ),
            ),
            // Form(
            //   child: Wrap(
            //     children: [
            //       // Text(
            //       //   'Veuillez choisir une lettre à remplacer',
            //       //   style: Get.textTheme.button,
            //       // ),
            //       // const Gap(20),
            //       Row(
            //         children: [
            //           DropdownButtonFormField<String>(
            //                 menuMaxHeight: 150,
            //                 hint: const Text('Choisissez une lettre'),
            //                 decoration: InputDecoration(
            //                   enabledBorder: OutlineInputBorder(
            //                     borderSide: const BorderSide(
            //                         color: Colors.blue, width: 2),
            //                     borderRadius: BorderRadius.circular(20),
            //                   ),
            //                   border: OutlineInputBorder(
            //                     borderSide: const BorderSide(
            //                         color: Colors.blue, width: 2),
            //                     borderRadius: BorderRadius.circular(20),
            //                   ),
            //                   filled: true,
            //                   fillColor: Colors.blueAccent,
            //                 ),
            //                 validator: (value) => value == null
            //                     ? "Choisissez une lettre"
            //                     : null,
            //                 dropdownColor: Colors.blueAccent,
            //                 onChanged: (String? value) {
            //                   controller.currentSpecialLetter.value =
            //                       value!;
            //                   data.letter = ascii
            //                       .encode(
            //                           controller.currentSpecialLetter.value)
            //                       .first;
            //                   controller.lettersPlaced.add(
            //                       TileInfo(tile: data, position: position));
            //                 },
            //                 items: List<String>.generate(
            //                         26,
            //                         (index) =>
            //                             String.fromCharCode(index + 65))
            //                     .map((e) => DropdownMenuItem(
            //                         value: e, child: Text(e)))
            //                     .toList(),
            //               ),
            //         ],
            //       ),
            //       // Obx(() => DropdownButton<String>(
            //       //       menuMaxHeight: 150,
            //       //       hint: Text('Lettres'),
            //       //       value: controller.currentSpecialLetter.value,
            //       //       items: List<String>.generate(26,
            //       //               (index) => String.fromCharCode(index + 65))
            //       //           .map((e) =>
            //       //               DropdownMenuItem(value: e, child: Text(e)))
            //       //           .toList(),
            //       //       onChanged: (String? value) {
            //       //         controller.currentSpecialLetter.value = value!;
            //       //         data.letter = ascii
            //       //             .encode(controller.currentSpecialLetter.value)
            //       //             .first;
            //       //         controller.lettersPlaced.add(
            //       //             TileInfo(tile: data, position: position));
            //       //       },
            //       //     )),
            //       const Gap(20),
            //       ElevatedButton.icon(
            //           onPressed: () {
            //             Get.back();
            //           },
            //           icon: const Icon(Icons.check),
            //           label: const Text('Confirmer'))
            //     ],
            //   ),
            // ),
          ),
          isDismissible: false,
          barrierColor: Colors.transparent,
          enableDrag: false,
        );
      } else {
        final tileInfo = TileInfo(tile: data, position: position);
        controller.lettersPlaced.add(tileInfo);
      }
    }, builder: (
      BuildContext context,
      List<dynamic> accepted,
      List<dynamic> rejected,
    ) {
      return Padding(
        padding: const EdgeInsets.all(3.0),
        child: SizedBox.expand(
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: color,
              borderRadius: const BorderRadius.all(Radius.elliptical(6, 4)),
            ),
            child: _buildLabel(context),
          ),
        ),
      );
    });
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
          style: const TextStyle(color: Colors.black),
        ),
      ),
    );
  }
}
