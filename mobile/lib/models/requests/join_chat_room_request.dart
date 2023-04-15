import 'dart:convert';

import 'package:client_leger/models/join_chat_room_payload.dart';
import 'package:client_leger/models/join_room_payload.dart';

class JoinChatRoomRequest {
  JoinChatRoomRequest({
    required this.event,
    required this.payload
  });

  String event;
  JoinChatRoomPayload payload;

  factory JoinChatRoomRequest.fromRawJson(String str) =>
      JoinChatRoomRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory JoinChatRoomRequest.fromJson(Map<String, dynamic> json) => JoinChatRoomRequest(
      event: json["event"],
      payload: JoinChatRoomPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}