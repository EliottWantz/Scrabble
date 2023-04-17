class JoinDMPayload {
  String username;
  String toId;
  String toUsername;

  JoinDMPayload({
    required this.username,
    required this.toId,
    required this.toUsername
  });

  factory JoinDMPayload.fromJson(Map<String, dynamic> json) => JoinDMPayload(
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