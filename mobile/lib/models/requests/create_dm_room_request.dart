import 'dart:convert';

import '../create_dm_room_payload.dart';
import '../create_room_payload.dart';

class CreateDMRoomRequest {
  CreateDMRoomRequest({
    required this.event,
    required this.payload
  });

  String event;
  CreateDMRoomPayload payload;

  factory CreateDMRoomRequest.fromRawJson(String str) =>
      CreateDMRoomRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory CreateDMRoomRequest.fromJson(Map<String, dynamic> json) => CreateDMRoomRequest(
      event: json["event"],
      payload: CreateDMRoomPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}