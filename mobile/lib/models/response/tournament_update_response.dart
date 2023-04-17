import 'dart:convert';

import 'package:client_leger/models/tournament.dart';

class TournamentUpdateResponse {
  TournamentUpdateResponse({required this.event,required this.payload});

  String event;
  Tournament payload;

  factory TournamentUpdateResponse.fromRawJson(String str) =>
      TournamentUpdateResponse.fromJson(json.decode(str));

  factory TournamentUpdateResponse.fromJson(Map<String, dynamic> json) => TournamentUpdateResponse(
      event: json["event"],
      payload: Tournament.fromJson(json["payload"]["tournament"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload?.toJson()
  };
}