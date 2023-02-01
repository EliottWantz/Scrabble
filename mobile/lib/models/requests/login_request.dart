import 'dart:convert';

class LoginRequest {
  LoginRequest({
    required this.username,
    required this.password,
  });

  String username;
  String password;

  factory LoginRequest.fromRawJson(String str) =>
      LoginRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory LoginRequest.fromJson(Map<String, dynamic> json) => LoginRequest(
    username: json["email"],
    password: json["password"],
  );

  Map<String, dynamic> toJson() => {
    "email": username,
    "password": password,
  };
}