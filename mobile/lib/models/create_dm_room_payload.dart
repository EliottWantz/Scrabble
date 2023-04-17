class CreateDMRoomPayload {
  String username;
  String toId;
  String toUsername;

  CreateDMRoomPayload({
    required this.username,
    required this.toId,
    required this.toUsername
  });

  factory CreateDMRoomPayload.fromJson(Map<String, dynamic> json) => CreateDMRoomPayload(
      username: json["username"],
      toId: json["toId"],
      toUsername: json["toUsername"]
  );

  Map<String, dynamic> toJson() => {
    "username": username,
    "toId": toId,
    "toUsername": toUsername
  };
}