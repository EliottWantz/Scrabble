import 'dart:convert';

import 'package:client_leger/models/invited_to_game_payload.dart';

import '../friend_request_payload.dart';

class InvitedToGameResponse {
  InvitedToGameResponse({required this.event, required this.payload});

  String event;
  InvitedToGamePayload payload;

  factory InvitedToGameResponse.fromRawJson(String str) =>
      InvitedToGameResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory InvitedToGameResponse.fromJson(Map<String, dynamic> json) => InvitedToGameResponse(
      event: json["event"],
      payload: InvitedToGamePayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload?.toJson(),
  };
}