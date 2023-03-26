import 'dart:convert';

import '../joined_room_payload.dart';
import '../room.dart';
import '../user_joined_room_payload.dart';

class UserJoinedDMRoomResponse {
  UserJoinedDMRoomResponse({
    required this.event,
    required this.payload
  });

  String event;
  UserJoinedRoomPayload payload;

  factory UserJoinedDMRoomResponse.fromRawJson(String str) =>
      UserJoinedDMRoomResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory UserJoinedDMRoomResponse.fromJson(Map<String, dynamic> json) => UserJoinedDMRoomResponse(
      event: json["event"],
      payload: UserJoinedRoomPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}