import 'dart:convert';

import 'package:client_leger/models/joined_room_payload.dart';
import 'package:client_leger/models/list_joinable_games_payload.dart';
import 'package:client_leger/models/list_observable_games_payload.dart';
import 'package:client_leger/models/list_observable_tournaments_payload.dart';

class ObservableTournamentsResponse {
  ObservableTournamentsResponse({
    required this.event,
    required this.payload
  });

  String event;
  ObservableTournamentsPayload payload;

  factory ObservableTournamentsResponse.fromRawJson(String str) =>
      ObservableTournamentsResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ObservableTournamentsResponse.fromJson(Map<String, dynamic> json) => ObservableTournamentsResponse(
      event: json["event"],
      payload: ObservableTournamentsPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}