import 'dart:convert';

import '../room.dart';

class JoinedDMRoomResponse {
  JoinedDMRoomResponse({
    required this.event,
    required this.payload
  });

  String event;
  Room payload;

  factory JoinedDMRoomResponse.fromRawJson(String str) =>
      JoinedDMRoomResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory JoinedDMRoomResponse.fromJson(Map<String, dynamic> json) => JoinedDMRoomResponse(
      event: json["event"],
      payload: Room.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}