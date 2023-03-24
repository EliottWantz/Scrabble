class StartGamePayload {
  String gameId;

  StartGamePayload({
    required this.gameId
  });

  factory StartGamePayload.fromJson(Map<dynamic, dynamic> json) => StartGamePayload(
      gameId: json["gameId"]
  );

  Map<String, dynamic> toJson() => {
    "gameId": gameId
  };
}