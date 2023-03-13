class MoveInfo {
  String type;
  String letters;
  Map<String, String> covers;

  MoveInfo({
    required this.type,
    required this.letters,
    required this.covers});

  factory MoveInfo.fromJson(Map<String, dynamic> json) {
    return MoveInfo(
        type: json["type"],
        letters: json["letters"],
        covers: Map.from(json["covers"].map((key, value) => json[key][value]))
    );
  }

  Map<String, dynamic> toJson() => {
    "type": type,
    "letters": letters,
    "covers": covers
  };
}