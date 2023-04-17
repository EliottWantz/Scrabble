import 'dart:convert';

import 'package:client_leger/models/left_game_payload.dart';

import '../game.dart';

class LeftGameResponse {
  LeftGameResponse({
    required this.event,
    required this.payload
  });

  String event;
  LeftGamePayload payload;

  factory LeftGameResponse.fromRawJson(String str) =>
      LeftGameResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory LeftGameResponse.fromJson(Map<String, dynamic> json) => LeftGameResponse(
      event: json["event"],
      payload: LeftGamePayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}