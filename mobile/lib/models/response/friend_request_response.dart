import 'dart:convert';

import '../friend_request_payload.dart';

class FriendRequestResponse {
  FriendRequestResponse({this.event, this.payload});

  String ?event;
  FriendRequestPayload ?payload;

  factory FriendRequestResponse.fromRawJson(String str) =>
      FriendRequestResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory FriendRequestResponse.fromJson(Map<String, dynamic> json) => FriendRequestResponse(
      event: json["event"],
      payload: FriendRequestPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload?.toJson(),
  };
}