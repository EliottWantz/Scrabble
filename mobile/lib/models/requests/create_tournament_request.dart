import 'dart:convert';

import 'package:client_leger/models/create_tournament_payload.dart';


class CreateTournamentRequest {
  CreateTournamentRequest({
    required this.event,
    required this.payload
  });

  String event;
  CreateTournamentPayload payload;

  factory CreateTournamentRequest.fromRawJson(String str) =>
      CreateTournamentRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory CreateTournamentRequest.fromJson(Map<String, dynamic> json) => CreateTournamentRequest(
      event: json["event"],
      payload: CreateTournamentPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}