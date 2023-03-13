import 'dart:convert';

import '../game_update_payload.dart';

class GameUpdateResponse {
  GameUpdateResponse({required this.event,required this.payload});

  String event;
  GameUpdatePayload payload;

  factory GameUpdateResponse.fromRawJson(String str) =>
      GameUpdateResponse.fromJson(json.decode(str));

  factory GameUpdateResponse.fromJson(Map<String, dynamic> json) => GameUpdateResponse(
      event: json["event"],
      payload: GameUpdatePayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload?.toJson()
  };
}