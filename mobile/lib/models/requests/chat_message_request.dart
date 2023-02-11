import 'dart:convert';

import 'package:client_leger/models/chat_message_payload.dart';

class ChatMessageRequest {
  ChatMessageRequest({this.event, this.payload});

  String ?event;
  ChatMessagePayload ?payload;

  factory ChatMessageRequest.fromRawJson(String str) =>
      ChatMessageRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ChatMessageRequest.fromJson(Map<String, dynamic> json) => ChatMessageRequest(
      event: json["event"],
      payload: ChatMessagePayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload?.toJson(),
  };
}