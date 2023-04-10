import 'dart:convert';

import 'package:client_leger/models/tournament.dart';

class JoinedTournamentResponse {
  JoinedTournamentResponse({
    required this.event,
    required this.payload
  });

  String event;
  Tournament payload;

  factory JoinedTournamentResponse.fromRawJson(String str) =>
      JoinedTournamentResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory JoinedTournamentResponse.fromJson(Map<String, dynamic> json) => JoinedTournamentResponse(
      event: json["event"],
      payload: Tournament.fromJson(json["payload"]["tournament"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}