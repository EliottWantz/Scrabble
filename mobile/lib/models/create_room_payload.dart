class CreateRoomPayload {
  String roomName;
  List<String> userIds;

  CreateRoomPayload({
    required this.roomName,
    required this.userIds
  });

  factory CreateRoomPayload.fromJson(Map<String, dynamic> json) => CreateRoomPayload(
      roomName: json["roomName"],
      userIds: List<String>.from((json["userIds"] as List).map(
              (userId) => json[userId])
      )
  );

  Map<String, dynamic> toJson() => {
    "roomName": roomName,
    "userIds": userIds,
  };
}