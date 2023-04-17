import 'dart:convert';

import 'package:client_leger/models/joined_room_payload.dart';
import 'package:client_leger/models/list_joinable_games_payload.dart';

import '../list_users_payload.dart';
import '../new_user_payload.dart';
import '../user.dart';

class NewUserResponse {
  NewUserResponse({
    required this.event,
    required this.payload
  });

  String event;
  NewUserPayload payload;

  factory NewUserResponse.fromRawJson(String str) =>
      NewUserResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory NewUserResponse.fromJson(Map<String, dynamic> json) => NewUserResponse(
      event: json["event"],
      payload: NewUserPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}