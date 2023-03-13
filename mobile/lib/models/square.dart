import 'package:client_leger/models/position.dart';
import 'package:client_leger/models/tile.dart';

class Square {
  Tile? tile;
  int letterMultiplier;
  int wordMutiplier;
  Position position;

  Square({
    required this.tile,
    required this.letterMultiplier,
    required this.wordMutiplier,
    required this.position});

  factory Square.fromJson(Map<String, dynamic> json) {
    return Square(
      tile: json["Tile"] != null ? Tile.fromJson(json["Tile"]) : null,
      letterMultiplier: json["LetterMultiplier"],
      wordMutiplier: json["WordMultiplier"],
      position: Position.fromJson(json["Position"]));
  }

  Map<String, dynamic> toJson() => {
    "tile": tile?.toJson(),
    "letterMultiplier": letterMultiplier,
    "wordMultiplier": wordMutiplier,
    "position": position.toJson()
  };
}