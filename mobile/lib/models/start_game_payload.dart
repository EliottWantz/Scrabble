class StartGamePayload {
  String roomId;

  StartGamePayload({
    required this.roomId
  });

  factory StartGamePayload.fromJson(Map<dynamic, dynamic> json) => StartGamePayload(
      roomId: json["roomId"]
  );

  Map<String, dynamic> toJson() => {
    "roomId": roomId
  };
}