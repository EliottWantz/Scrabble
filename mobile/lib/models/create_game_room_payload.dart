class CreateGameRoomPayload {
  bool isPrivate;
  String password;
  List<String> withUserIds;

  CreateGameRoomPayload({
    required this.isPrivate,
    required this.password,
    required this.withUserIds
  });

  factory CreateGameRoomPayload.fromJson(Map<String, dynamic> json) => CreateGameRoomPayload(
      isPrivate: json["isPrivate"],
      password: json["password"],
      withUserIds: List<String>.from((json["withUserIds"] as List).map(
              (userId) => json[userId])
      )
  );

  Map<String, dynamic> toJson() => {
    "isPrivate": isPrivate,
    "password": password,
    "withUserIds": withUserIds,
  };
}