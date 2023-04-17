class LeftGamePayload {
  String gameId;

  LeftGamePayload({required this.gameId});

  factory LeftGamePayload.fromJson(Map<String, dynamic> json) => LeftGamePayload(
      gameId: json["gameId"]
  );

  Map<String, dynamic> toJson() => {
    "gameId": gameId
  };
}