import 'dart:convert';

import 'package:client_leger/models/user_left_game_payload.dart';

import '../joined_room_payload.dart';
import '../room.dart';
import '../user_joined_game_payload.dart';

class UserLeftGameResponse {
  UserLeftGameResponse({
    required this.event,
    required this.payload
  });

  String event;
  UserLeftGamePayload payload;

  factory UserLeftGameResponse.fromRawJson(String str) =>
      UserLeftGameResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory UserLeftGameResponse.fromJson(Map<String, dynamic> json) => UserLeftGameResponse(
      event: json["event"],
      payload: UserLeftGamePayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}