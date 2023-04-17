import 'dart:convert';

import 'package:client_leger/models/joined_room_payload.dart';
import 'package:client_leger/models/list_joinable_games_payload.dart';
import 'package:client_leger/models/list_joinable_tournaments_payload.dart';

class JoinableTournamentsResponse {
  JoinableTournamentsResponse({
    required this.event,
    required this.payload
  });

  String event;
  JoinableTournamentsPayload payload;

  factory JoinableTournamentsResponse.fromRawJson(String str) =>
      JoinableTournamentsResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory JoinableTournamentsResponse.fromJson(Map<String, dynamic> json) => JoinableTournamentsResponse(
      event: json["event"],
      payload: JoinableTournamentsPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}