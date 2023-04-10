import 'dart:convert';

import 'package:client_leger/models/join_room_payload.dart';
import 'package:client_leger/models/join_tournament_payload.dart';

class JoinTournamentRequest {
  JoinTournamentRequest({
    required this.event,
    required this.payload
  });

  String event;
  JoinTournamentPayload payload;

  factory JoinTournamentRequest.fromRawJson(String str) =>
      JoinTournamentRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory JoinTournamentRequest.fromJson(Map<String, dynamic> json) => JoinTournamentRequest(
      event: json["event"],
      payload: JoinTournamentPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}