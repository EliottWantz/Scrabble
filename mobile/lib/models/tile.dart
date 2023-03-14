class Tile {
  int letter;
  int value;

  Tile({
    required this.letter,
    required this.value});

  factory Tile.fromJson(Map<String, dynamic> json) {
    return Tile(
      letter: json["Letter"],
      value: json["Value"]
    );
  }

  Map<String, dynamic> toJson() => {
    "letter": letter,
    "value": value
  };
}