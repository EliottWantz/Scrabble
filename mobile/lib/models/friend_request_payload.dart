class FriendRequestPayload {
  String fromId;
  String fromUsername;

  FriendRequestPayload({
    required this.fromId,
    required this.fromUsername
  });

  factory FriendRequestPayload.fromJson(Map<String, dynamic> json) => FriendRequestPayload(
      fromId: json["fromId"],
      fromUsername: json["fromUsername"]
  );

  Map<String, dynamic> toJson() => {
    "roomName": fromId,
    "userIds": fromUsername,
  };
}