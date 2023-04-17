import 'dart:convert';

import 'package:client_leger/models/game_over_payload.dart';

import '../game_update_payload.dart';

class GameOverResponse {
  GameOverResponse({required this.event,required this.payload});

  String event;
  GameOverPayload payload;

  factory GameOverResponse.fromRawJson(String str) =>
      GameOverResponse.fromJson(json.decode(str));

  factory GameOverResponse.fromJson(Map<String, dynamic> json) => GameOverResponse(
      event: json["event"],
      payload: GameOverPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload?.toJson()
  };
}