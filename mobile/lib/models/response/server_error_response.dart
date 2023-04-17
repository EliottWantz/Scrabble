import 'dart:convert';

import 'package:client_leger/models/error_payload.dart';
import 'package:client_leger/models/timer_payload.dart';

class ErrorResponse {
  ErrorResponse({required this.event, required this.payload});

  String event;
  ErrorPayload payload;

  factory ErrorResponse.fromRawJson(String str) =>
      ErrorResponse.fromJson(json.decode(str));

  factory ErrorResponse.fromJson(Map<String, dynamic> json) => ErrorResponse(
      event: json["event"],
      payload: ErrorPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload?.toJson()
  };
}