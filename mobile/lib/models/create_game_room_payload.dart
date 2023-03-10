class CreateGameRoomPayload {
  List<String> userIds;

  CreateGameRoomPayload({
    required this.userIds
  });

  factory CreateGameRoomPayload.fromJson(Map<String, dynamic> json) => CreateGameRoomPayload(
      userIds: List<String>.from((json["userIds"] as List).map(
              (userId) => json[userId])
      )
  );

  Map<String, dynamic> toJson() => {
    "userIds": userIds,
  };
}