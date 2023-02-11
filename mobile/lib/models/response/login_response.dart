import 'dart:convert';

import 'package:client_leger/models/user.dart';

class LoginResponse {
  LoginResponse({this.user, this.error});

  User ?user;
  String ?error;

  factory LoginResponse.fromRawJson(String str) =>
      LoginResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory LoginResponse.fromJson(Map<String, dynamic> json) => LoginResponse(
        user: User.fromJson(json["user"]),
        error: json["error"],
      );

  Map<String, dynamic> toJson() => {
        "user": user?.toJson(),
        "error": error,
      };
}
