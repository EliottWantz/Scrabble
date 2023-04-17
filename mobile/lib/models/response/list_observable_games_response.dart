import 'dart:convert';

import 'package:client_leger/models/joined_room_payload.dart';
import 'package:client_leger/models/list_joinable_games_payload.dart';
import 'package:client_leger/models/list_observable_games_payload.dart';

class ObservableGamesResponse {
  ObservableGamesResponse({
    required this.event,
    required this.payload
  });

  String event;
  ObservableGamesPayload payload;

  factory ObservableGamesResponse.fromRawJson(String str) =>
      ObservableGamesResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ObservableGamesResponse.fromJson(Map<String, dynamic> json) => ObservableGamesResponse(
      event: json["event"],
      payload: ObservableGamesPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}