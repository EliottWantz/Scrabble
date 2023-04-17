import 'dart:convert';

class AcceptFriendRequest {
  AcceptFriendRequest({required this.friendId});

  String friendId;

  factory AcceptFriendRequest.fromRawJson(String str) =>
      AcceptFriendRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory AcceptFriendRequest.fromJson(Map<String, dynamic> json) =>
      AcceptFriendRequest(friendId: json["friendId"]);

  Map<String, dynamic> toJson() => {"friendId": friendId};
}