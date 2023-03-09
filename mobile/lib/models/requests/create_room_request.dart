import 'dart:convert';

import '../create_room_payload.dart';

class CreateRoomRequest {
  CreateRoomRequest({
    required this.event,
    required this.payload
  });

  String event;
  CreateRoomPayload payload;

  factory CreateRoomRequest.fromRawJson(String str) =>
      CreateRoomRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory CreateRoomRequest.fromJson(Map<String, dynamic> json) => CreateRoomRequest(
      event: json["event"],
      payload: CreateRoomPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}