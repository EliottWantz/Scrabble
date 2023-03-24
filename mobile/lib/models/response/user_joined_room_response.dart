import 'dart:convert';

import '../joined_room_payload.dart';
import '../room.dart';
import '../user_joined_room_payload.dart';

class UserJoinedRoomResponse {
  UserJoinedRoomResponse({
    required this.event,
    required this.payload
  });

  String event;
  UserJoinedRoomPayload payload;

  factory UserJoinedRoomResponse.fromRawJson(String str) =>
      UserJoinedRoomResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory UserJoinedRoomResponse.fromJson(Map<String, dynamic> json) => UserJoinedRoomResponse(
      event: json["event"],
      payload: UserJoinedRoomPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}