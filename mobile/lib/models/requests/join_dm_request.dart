import 'dart:convert';

import '../join_dm_payload.dart';

class JoinDMRequest {
  JoinDMRequest({
    required this.event,
    required this.payload
  });

  String event;
  JoinDMPayload payload;

  factory JoinDMRequest.fromRawJson(String str) =>
      JoinDMRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory JoinDMRequest.fromJson(Map<String, dynamic> json) => JoinDMRequest(
      event: json["event"],
      payload: JoinDMPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}