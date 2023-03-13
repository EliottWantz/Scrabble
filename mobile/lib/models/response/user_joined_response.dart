import 'dart:convert';

import '../user_joined_payload.dart';

class UserJoinedResponse {
  UserJoinedResponse({required this.event, required this.payload});

  String event;
  UserJoinedPayload payload;

  factory UserJoinedResponse.fromRawJson(String str) =>
      UserJoinedResponse.fromJson(json.decode(str));

  factory UserJoinedResponse.fromJson(Map<String, dynamic> json) => UserJoinedResponse(
      event: json["event"],
      payload: UserJoinedPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}