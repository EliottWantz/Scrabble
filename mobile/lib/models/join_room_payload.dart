class JoinRoomPayload {
  String gameId;
  String? password;

  JoinRoomPayload({required this.gameId, this.password});

  factory JoinRoomPayload.fromJson(Map<String, dynamic> json) => JoinRoomPayload(
      gameId: json["gameId"],
      password: json["password"]
  );

  Map<String, dynamic> toJson() => {
    "gameId": gameId,
    "password": password
  };
}