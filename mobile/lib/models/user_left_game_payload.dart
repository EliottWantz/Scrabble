class UserLeftGamePayload {
  String gameId;
  String userId;

  UserLeftGamePayload({required this.gameId, required this.userId});

  factory UserLeftGamePayload.fromJson(Map<dynamic, dynamic> json) => UserLeftGamePayload(
      gameId: json["gameId"],
      userId: json["userId"]
  );

  Map<String, dynamic> toJson() => {
    "roomId": gameId,
    "user": userId
  };
}