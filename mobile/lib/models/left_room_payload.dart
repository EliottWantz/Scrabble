class LeftRoomPayload {
  String roomId;

  LeftRoomPayload({required this.roomId});

  factory LeftRoomPayload.fromJson(Map<String, dynamic> json) => LeftRoomPayload(
      roomId: json["roomId"]
  );

  Map<String, dynamic> toJson() => {
    "roomId": roomId
  };
}