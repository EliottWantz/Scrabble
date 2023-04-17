class JoinGamePayload {
  String gameId;

  JoinGamePayload({required this.gameId});

  factory JoinGamePayload.fromJson(Map<String, dynamic> json) => JoinGamePayload(
      gameId: json["gameId"]
  );

  Map<String, dynamic> toJson() => {
    "gameId": gameId
  };
}