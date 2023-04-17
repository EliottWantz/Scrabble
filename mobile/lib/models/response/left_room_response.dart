import 'dart:convert';

import 'package:client_leger/models/left_game_payload.dart';
import 'package:client_leger/models/left_room_payload.dart';

import '../game.dart';

class LeftRoomResponse {
  LeftRoomResponse({
    required this.event,
    required this.payload
  });

  String event;
  LeftRoomPayload payload;

  factory LeftRoomResponse.fromRawJson(String str) =>
      LeftRoomResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory LeftRoomResponse.fromJson(Map<String, dynamic> json) => LeftRoomResponse(
      event: json["event"],
      payload: LeftRoomPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}