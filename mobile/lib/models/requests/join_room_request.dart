import 'dart:convert';

import 'package:client_leger/models/join_room_payload.dart';

class JoinRoomRequest {
  JoinRoomRequest({
    required this.event,
    required this.payload
  });

  String event;
  JoinRoomPayload payload;

  factory JoinRoomRequest.fromRawJson(String str) =>
      JoinRoomRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory JoinRoomRequest.fromJson(Map<String, dynamic> json) => JoinRoomRequest(
      event: json["event"],
      payload: JoinRoomPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}