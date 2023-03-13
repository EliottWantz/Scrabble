import 'dart:ffi';

class Tile {
  Int32 letter;
  int value;

  Tile({
    required this.letter,
    required this.value});

  factory Tile.fromJson(Map<String, dynamic> json) {
    return Tile(
      letter: json["letter"],
      value: json["value"]
    );
  }

  Map<String, dynamic> toJson() => {
    "letter": letter,
    "value": value
  };
}