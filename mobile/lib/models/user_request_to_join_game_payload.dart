class UserRequestToJoinGamePayload {
  String gameId;
  String userId;
  String username;

  UserRequestToJoinGamePayload({required this.gameId, required this.userId, required this.username});

  factory UserRequestToJoinGamePayload.fromJson(Map<dynamic, dynamic> json) => UserRequestToJoinGamePayload(
      gameId: json["gameId"],
      userId: json["userId"],
      username: json["username"]
  );

  Map<String, dynamic> toJson() => {
    "gameId": gameId,
    "userId": userId,
    "username": username
  };
}