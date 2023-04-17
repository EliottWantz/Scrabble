import 'dart:convert';

import 'package:client_leger/models/user_joined_tournament_payload.dart';

import '../joined_room_payload.dart';
import '../room.dart';
import '../user_joined_game_payload.dart';

class UserJoinedTournamentResponse {
  UserJoinedTournamentResponse({
    required this.event,
    required this.payload
  });

  String event;
  UserJoinedTournamentPayload payload;

  factory UserJoinedTournamentResponse.fromRawJson(String str) =>
      UserJoinedTournamentResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory UserJoinedTournamentResponse.fromJson(Map<String, dynamic> json) => UserJoinedTournamentResponse(
      event: json["event"],
      payload: UserJoinedTournamentPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}