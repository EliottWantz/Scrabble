import 'dart:convert';

import 'package:client_leger/models/avatar.dart';

class RegisterRequest {
  RegisterRequest(
      {required this.email,
      required this.username,
      required this.password,
      this.avatar});

  String email;
  String password;
  String username;
  Avatar? avatar;

  factory RegisterRequest.fromRawJson(String str) =>
      RegisterRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory RegisterRequest.fromJson(Map<String, dynamic> json) =>
      RegisterRequest(
          email: json["email"],
          username: json["username"],
          password: json["password"],
          avatar: Avatar.fromJson(json["avatar"]));

  Map<String, dynamic> toJson() => {
        "email": email,
        "username": username,
        "password": password,
        "avatar": avatar!.toJson()
      };
}
