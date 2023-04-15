class JoinChatRoomPayload {
  String roomId;

  JoinChatRoomPayload({
    required this.roomId,
  });

  factory JoinChatRoomPayload.fromJson(Map<String, dynamic> json) => JoinChatRoomPayload(
      roomId: json["roomId"],
  );

  Map<String, dynamic> toJson() => {
    "roomId": roomId,
  };
}