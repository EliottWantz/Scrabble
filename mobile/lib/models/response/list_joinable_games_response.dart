import 'dart:convert';

import 'package:client_leger/models/joined_room_payload.dart';
import 'package:client_leger/models/list_joinable_games_payload.dart';

class JoinableGamesResponse {
  JoinableGamesResponse({
    required this.event,
    required this.payload
  });

  String event;
  JoinableGamesPayload payload;

  factory JoinableGamesResponse.fromRawJson(String str) =>
      JoinableGamesResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory JoinableGamesResponse.fromJson(Map<String, dynamic> json) => JoinableGamesResponse(
      event: json["event"],
      payload: JoinableGamesPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}