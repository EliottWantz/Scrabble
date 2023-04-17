import 'dart:convert';

import 'package:client_leger/models/user_request_to_join_game_payload.dart';

class UserRequestToJoinGameResponse {
  UserRequestToJoinGameResponse({
    required this.event,
    required this.payload
  });

  String event;
  UserRequestToJoinGamePayload payload;

  factory UserRequestToJoinGameResponse.fromRawJson(String str) =>
      UserRequestToJoinGameResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory UserRequestToJoinGameResponse.fromJson(Map<String, dynamic> json) => UserRequestToJoinGameResponse(
      event: json["event"],
      payload: UserRequestToJoinGamePayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}