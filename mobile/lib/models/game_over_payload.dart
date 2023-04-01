class GameOverPayload {
  String winnerId;

  GameOverPayload({
    required this.winnerId
  });

  factory GameOverPayload.fromJson(Map<String, dynamic> json) {
    return GameOverPayload(
        winnerId: json["winnerId"]
    );
  }

  Map<String, dynamic> toJson() => {
    "winnerId": winnerId
  };
}