import 'dart:convert';

import 'package:client_leger/models/first_square_payload.dart';

class FirstSquareRequest {
  FirstSquareRequest({required this.event, required this.payload});

  String event;
  FirstSquarePayload payload;

  factory FirstSquareRequest.fromRawJson(String str) =>
      FirstSquareRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory FirstSquareRequest.fromJson(Map<String, dynamic> json) =>
      FirstSquareRequest(
          event: json["event"],
          payload: FirstSquarePayload.fromJson(json["payload"]));

  Map<String, dynamic> toJson() =>
      {"event": event, "payload": payload.toJson()};
}
