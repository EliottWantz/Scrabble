import 'dart:convert';

import '../joined_room_payload.dart';
import '../room.dart';
import '../user_joined_game_payload.dart';

class UserJoinedGameResponse {
  UserJoinedGameResponse({
    required this.event,
    required this.payload
  });

  String event;
  UserJoinedGamePayload payload;

  factory UserJoinedGameResponse.fromRawJson(String str) =>
      UserJoinedGameResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory UserJoinedGameResponse.fromJson(Map<String, dynamic> json) => UserJoinedGameResponse(
      event: json["event"],
      payload: UserJoinedGamePayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}