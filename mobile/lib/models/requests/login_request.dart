import 'dart:convert';

class LoginRequest {
  LoginRequest({
    required this.username,
  });

  String username;

  factory LoginRequest.fromRawJson(String str) =>
      LoginRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory LoginRequest.fromJson(Map<String, dynamic> json) => LoginRequest(
    username: json["username"],
  );

  Map<String, dynamic> toJson() => {
    "username": username,
  };
}