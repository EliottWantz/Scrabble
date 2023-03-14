import 'dart:convert';

import 'package:client_leger/models/timer_payload.dart';

class TimerResponse {
  TimerResponse({required this.event, required this.payload});

  String event;
  TimerPayload payload;

  factory TimerResponse.fromRawJson(String str) =>
      TimerResponse.fromJson(json.decode(str));

  factory TimerResponse.fromJson(Map<String, dynamic> json) => TimerResponse(
      event: json["event"],
      payload: TimerPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload?.toJson()
  };
}