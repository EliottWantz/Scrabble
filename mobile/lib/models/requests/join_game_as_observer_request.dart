import 'dart:convert';

import 'package:client_leger/models/join_game_payload.dart';

import '../join_dm_payload.dart';

class JoinGameAsObserverRequest {
  JoinGameAsObserverRequest({
    required this.event,
    required this.payload
  });

  String event;
  JoinGamePayload payload;

  factory JoinGameAsObserverRequest.fromRawJson(String str) =>
      JoinGameAsObserverRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory JoinGameAsObserverRequest.fromJson(Map<String, dynamic> json) => JoinGameAsObserverRequest(
      event: json["event"],
      payload: JoinGamePayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}