import 'dart:convert';

import '../game.dart';

class JoinedGameResponse {
  JoinedGameResponse({
    required this.event,
    required this.payload
  });

  String event;
  Game payload;

  factory JoinedGameResponse.fromRawJson(String str) =>
      JoinedGameResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory JoinedGameResponse.fromJson(Map<String, dynamic> json) => JoinedGameResponse(
      event: json["event"],
      payload: Game.fromJson(json["payload"]["game"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}