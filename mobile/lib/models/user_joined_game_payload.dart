class UserJoinedGamePayload {
  String gameId;
  String userId;

  UserJoinedGamePayload({required this.gameId, required this.userId});

  factory UserJoinedGamePayload.fromJson(Map<dynamic, dynamic> json) => UserJoinedGamePayload(
      gameId: json["gameId"],
      userId: json["userId"]
  );

  Map<String, dynamic> toJson() => {
    "roomId": gameId,
    "user": userId
  };
}