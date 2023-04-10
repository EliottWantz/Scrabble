class MoveInfo {
  String type;
  String letters;
  Map<String, String> covers;
  int? score;

  MoveInfo(
      {required this.type,
      required this.letters,
      required this.covers,
      this.score});

  factory MoveInfo.fromJson(Map<dynamic, dynamic> json) {
    return MoveInfo(
        type: json["type"],
        letters: json["letters"],
        // covers: Map.from((json["covers"] as Map).map
        //   ((key, value) => json["covers"][key][value])
        // )
        covers: Map.from(json["covers"] as Map),
        score: json["score"]);
  }

  Map<String, dynamic> toJson() =>
      {"type": type, "letters": letters, "covers": covers, "score": score};

  @override
  String toString() {
    return '{type: ${type}, covers: ${covers.toString()}}';
  }
}
