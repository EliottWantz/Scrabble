import 'dart:convert';

class LogoutRequest {
  LogoutRequest({
    required this.id,
    required this.username,
  });

  String username;
  String id;

  factory LogoutRequest.fromRawJson(String str) =>
      LogoutRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory LogoutRequest.fromJson(Map<String, dynamic> json) => LogoutRequest(
    username: json["username"],
    id: json["id"],
  );

  Map<String, dynamic> toJson() => {
    "username": username,
    "id": id,
  };
}