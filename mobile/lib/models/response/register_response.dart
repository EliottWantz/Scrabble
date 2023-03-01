import 'dart:convert';

import 'package:client_leger/models/user.dart';

// {
// "user": {
// "id": "27761337-f3bf-4005-8e99-6dabeec00f2e",
// "username": "test",
// "email": "test@gmail.com",
// "avatar": {},
// "Preferences": {
// "theme": ""
// }
// },
// "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNzc2MTMzNy1mM2JmLTQwMDUtOGU5OS02ZGFiZWVjMDBmMmUiLCJleHAiOjE2ODAxNTMxNDV9.jXlmwck2VVUHXk0Ee8Of0n1wJ5M2VNTk5XLtiJP64eE"
// }

class RegisterResponse {
  RegisterResponse({this.token, this.error, this.user});

  String? token;
  String? error;
  User? user;

  factory RegisterResponse.fromRawJson(String str) =>
      RegisterResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory RegisterResponse.fromJson(Map<String, dynamic> json) =>
      RegisterResponse(
        token: json["token"],
        user: User.fromJson(json["user"]),
        error: json["error"],
      );

  Map<String, dynamic> toJson() => {
        "token": token,
        "user": user!.toJson(),
        "error": error,
      };
}
