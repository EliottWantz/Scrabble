import 'dart:convert';

import '../indice_payload.dart';

class IndiceRequest {
  IndiceRequest({this.event, this.payload});

  String ?event;
  IndicePayload ?payload;

  factory IndiceRequest.fromRawJson(String str) =>
      IndiceRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory IndiceRequest.fromJson(Map<String, dynamic> json) => IndiceRequest(
      event: json["event"],
      payload: IndicePayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload?.toJson(),
  };
}