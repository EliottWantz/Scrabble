import 'dart:convert';

import 'package:client_leger/models/start_tournament_payload.dart';

import '../start_game_payload.dart';

class StartTournamentRequest {
  StartTournamentRequest({this.event, this.payload});

  String ?event;
  StartTournamentPayload ?payload;

  factory StartTournamentRequest.fromRawJson(String str) =>
      StartTournamentRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory StartTournamentRequest.fromJson(Map<String, dynamic> json) => StartTournamentRequest(
      event: json["event"],
      payload: StartTournamentPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload?.toJson(),
  };
}