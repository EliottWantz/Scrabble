import 'dart:convert';

import '../joined_room_payload.dart';
import '../room.dart';

class JoinedRoomResponse {
  JoinedRoomResponse({
    required this.event,
    required this.payload
  });

  String event;
  Room payload;

  factory JoinedRoomResponse.fromRawJson(String str) =>
      JoinedRoomResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory JoinedRoomResponse.fromJson(Map<String, dynamic> json) => JoinedRoomResponse(
      event: json["event"],
      payload: Room.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}