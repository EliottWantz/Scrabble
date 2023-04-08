import 'dart:convert';

import 'package:client_leger/models/user_request_to_join_game_payload.dart';
import 'package:client_leger/models/verdict_join_game_request_payload.dart';

class UserRequestToJoinGameAcceptedResponse {
  UserRequestToJoinGameAcceptedResponse({
    required this.event,
    required this.payload
  });

  String event;
  VerdictJoinGameRequestPayload payload;

  factory UserRequestToJoinGameAcceptedResponse.fromRawJson(String str) =>
      UserRequestToJoinGameAcceptedResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory UserRequestToJoinGameAcceptedResponse.fromJson(Map<String, dynamic> json) => UserRequestToJoinGameAcceptedResponse(
      event: json["event"],
      payload: VerdictJoinGameRequestPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}