import 'dart:convert';

import 'package:client_leger/models/joined_room_payload.dart';
import 'package:client_leger/models/list_chat_rooms_payload.dart';
import 'package:client_leger/models/list_joinable_games_payload.dart';

import '../list_users_payload.dart';

class ListChatRoomsResponse {
  ListChatRoomsResponse({
    required this.event,
    required this.payload
  });

  String event;
  ListChatRoomsPayload payload;

  factory ListChatRoomsResponse.fromRawJson(String str) =>
      ListChatRoomsResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ListChatRoomsResponse.fromJson(Map<String, dynamic> json) => ListChatRoomsResponse(
      event: json["event"],
      payload: ListChatRoomsPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload.toJson()
  };
}