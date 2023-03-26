import 'dart:convert';

import '../friend_request_payload.dart';

class AcceptFriendResponse {
  AcceptFriendResponse({this.event, this.payload});

  String ?event;
  FriendRequestPayload ?payload;

  factory AcceptFriendResponse.fromRawJson(String str) =>
      AcceptFriendResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory AcceptFriendResponse.fromJson(Map<String, dynamic> json) => AcceptFriendResponse(
      event: json["event"],
      payload: FriendRequestPayload.fromJson(json["payload"])
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload?.toJson(),
  };
}