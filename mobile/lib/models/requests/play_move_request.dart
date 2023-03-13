import 'dart:convert';

import 'package:client_leger/models/play_move_payload.dart';

class PlayMoveRequest {
  PlayMoveRequest({this.event, this.payload});

  String ?event;
  PlayMovePayload ?payload;

  factory PlayMoveRequest.fromRawJson(String str) =>
      PlayMoveRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory PlayMoveRequest.fromJson(Map<String, dynamic> json) => PlayMoveRequest(
      event: json["event"],
      payload: PlayMovePayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload?.toJson(),
  };
}