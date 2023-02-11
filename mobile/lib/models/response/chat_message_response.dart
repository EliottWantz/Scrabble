import 'dart:convert';

import 'package:client_leger/models/chat_message_payload.dart';

class ChatMessageResponse {
  ChatMessageResponse({this.event, this.payload});

  String ?event;
  ChatMessagePayload ?payload;

  factory ChatMessageResponse.fromRawJson(String str) =>
      ChatMessageResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());
  
  factory ChatMessageResponse.fromJson(Map<String, dynamic> json) => ChatMessageResponse(
      event: json["event"],
      payload: ChatMessagePayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload?.toJson(),
  };
}