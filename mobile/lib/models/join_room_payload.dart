class JoinRoomPayload {
  String roomId;

  JoinRoomPayload({required this.roomId});

  factory JoinRoomPayload.fromJson(Map<String, dynamic> json) => JoinRoomPayload(
      roomId: json["roomId"]
  );

  Map<String, dynamic> toJson() => {
    "roomId": roomId
  };
}