class JoinRoomPayload {
  String gameId;

  JoinRoomPayload({required this.gameId});

  factory JoinRoomPayload.fromJson(Map<String, dynamic> json) => JoinRoomPayload(
      gameId: json["gameId"]
  );

  Map<String, dynamic> toJson() => {
    "gameId": gameId
  };
}