import 'dart:convert';

import 'package:client_leger/models/user.dart';

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
