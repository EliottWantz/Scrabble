class UserJoinedRoomPayload {
  String roomId;
  String userId;

  UserJoinedRoomPayload({required this.roomId, required this.userId});

  factory UserJoinedRoomPayload.fromJson(Map<dynamic, dynamic> json) => UserJoinedRoomPayload(
      roomId: json["roomId"],
      userId: json["userId"]
  );

  Map<String, dynamic> toJson() => {
    "roomId": roomId,
    "user": userId
  };
}