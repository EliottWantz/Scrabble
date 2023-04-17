import 'dart:convert';

import 'package:client_leger/models/joined_game_as_observer_payload.dart';

import '../joined_room_payload.dart';
import '../room.dart';
import '../user_joined_game_payload.dart';

class JoinedGameAsObserverResponse {
  JoinedGameAsObserverResponse({
    required this.event,
    required this.payload
  });

  String event;
  JoinedGameAsObserverPayload payload;

  factory JoinedGameAsObserverResponse.fromRawJson(String str) =>
      JoinedGameAsObserverResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory JoinedGameAsObserverResponse.fromJson(Map<String, dynamic> json) => JoinedGameAsObserverResponse(
      event: json["event"],
      payload: JoinedGameAsObserverPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}