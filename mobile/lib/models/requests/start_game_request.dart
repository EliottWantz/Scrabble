import 'dart:convert';

import '../start_game_payload.dart';

class StartGameRequest {
  StartGameRequest({this.event, this.payload});

  String ?event;
  StartGamePayload ?payload;

  factory StartGameRequest.fromRawJson(String str) =>
      StartGameRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory StartGameRequest.fromJson(Map<String, dynamic> json) => StartGameRequest(
      event: json["event"],
      payload: StartGamePayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload?.toJson(),
  };
}