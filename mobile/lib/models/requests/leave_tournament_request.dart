import 'dart:convert';

import 'package:client_leger/models/join_room_payload.dart';
import 'package:client_leger/models/join_tournament_payload.dart';
import 'package:client_leger/models/leave_tournament_payload.dart';

class LeaveTournamentRequest {
  LeaveTournamentRequest({
    required this.event,
    required this.payload
  });

  String event;
  LeaveTournamentPayload payload;

  factory LeaveTournamentRequest.fromRawJson(String str) =>
      LeaveTournamentRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory LeaveTournamentRequest.fromJson(Map<String, dynamic> json) => LeaveTournamentRequest(
      event: json["event"],
      payload: LeaveTournamentPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}