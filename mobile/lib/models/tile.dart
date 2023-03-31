class Tile {
  int letter;
  int value;
  bool? isSpecial;
  bool? isEasel;

  Tile(
      {required this.letter,
      required this.value,
      this.isSpecial,
      this.isEasel});

  factory Tile.fromJson(Map<String, dynamic> json) {
    return Tile(letter: json["letter"], value: json["value"]);
  }

  Map<String, dynamic> toJson() => {"letter": letter, "value": value};
}
