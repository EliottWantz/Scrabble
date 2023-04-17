import 'dart:convert';

class UpdateUsernameRequest {
  UpdateUsernameRequest({required this.username, required this.id});

  String username;
  String id;

  factory UpdateUsernameRequest.fromRawJson(String str) =>
      UpdateUsernameRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory UpdateUsernameRequest.fromJson(Map<String, dynamic> json) =>
      UpdateUsernameRequest(username: json["username"], id: json["id"]);

  Map<String, dynamic> toJson() => {"username": username, "id": id};
}
