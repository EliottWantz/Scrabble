import 'dart:convert';

class SendFriendRequest {
  SendFriendRequest({required this.friendId});

  String friendId;

  factory SendFriendRequest.fromRawJson(String str) =>
      SendFriendRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory SendFriendRequest.fromJson(Map<String, dynamic> json) =>
      SendFriendRequest(friendId: json["friendId"]);

  Map<String, dynamic> toJson() => {"friendId": friendId};
}