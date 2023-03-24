import 'dart:convert';

import 'package:client_leger/models/joined_room_payload.dart';
import 'package:client_leger/models/list_joinable_games_payload.dart';

import '../list_users_payload.dart';

class ListUsersResponse {
  ListUsersResponse({
    required this.event,
    required this.payload
  });

  String event;
  ListUsersPayload payload;

  factory ListUsersResponse.fromRawJson(String str) =>
      ListUsersResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ListUsersResponse.fromJson(Map<String, dynamic> json) => ListUsersResponse(
      event: json["event"],
      payload: ListUsersPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}