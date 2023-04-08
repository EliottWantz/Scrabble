class VerdictJoinGameRequestPayload {
  String gameId;
  String userId;

  VerdictJoinGameRequestPayload({required this.gameId, required this.userId});

  factory VerdictJoinGameRequestPayload.fromJson(Map<dynamic, dynamic> json) => VerdictJoinGameRequestPayload(
      gameId: json["gameId"],
      userId: json["userId"]
  );

  Map<String, dynamic> toJson() => {
    "gameId": gameId,
    "userId": userId
  };
}