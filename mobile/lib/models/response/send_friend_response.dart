import 'dart:convert';

import 'package:client_leger/models/user.dart';

class SendFriendResponse {
  SendFriendResponse({required this.user, required this.token});

  User user;
  String token;

  factory SendFriendResponse.fromRawJson(String str) =>
      SendFriendResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory SendFriendResponse.fromJson(Map<String, dynamic> json) => SendFriendResponse(
    user: User.fromJson(json["user"]),
    token: json["token"],
  );

  Map<String, dynamic> toJson() => {
    "user": user.toJson(),
    "token": token,
  };
}