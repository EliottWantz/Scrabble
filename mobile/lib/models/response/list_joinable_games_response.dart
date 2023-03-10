import 'dart:convert';

import 'package:client_leger/models/joined_room_payload.dart';

class ListJoinableGamesResponse {
  ListJoinableGamesResponse({
    required this.event,
    required this.payload
  });

  String event;
  JoinedRoomPayload payload;

  factory ListJoinableGamesResponse.fromRawJson(String str) =>
      ListJoinableGamesResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ListJoinableGamesResponse.fromJson(Map<String, dynamic> json) => ListJoinableGamesResponse(
      event: json["event"],
      payload: JoinedRoomPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}