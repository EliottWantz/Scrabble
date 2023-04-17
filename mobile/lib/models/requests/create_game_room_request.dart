import 'dart:convert';

import '../create_game_room_payload.dart';

class CreateGameRoomRequest {
  CreateGameRoomRequest({
    required this.event,
    required this.payload
  });

  String event;
  CreateGameRoomPayload payload;

  factory CreateGameRoomRequest.fromRawJson(String str) =>
      CreateGameRoomRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory CreateGameRoomRequest.fromJson(Map<String, dynamic> json) => CreateGameRoomRequest(
      event: json["event"],
      payload: CreateGameRoomPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}