import 'dart:convert';

class DeleteFriendRequest {
  DeleteFriendRequest({required this.friendId});

  String friendId;

  factory DeleteFriendRequest.fromRawJson(String str) =>
      DeleteFriendRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory DeleteFriendRequest.fromJson(Map<String, dynamic> json) =>
      DeleteFriendRequest(friendId: json["friendId"]);

  Map<String, dynamic> toJson() => {"friendId": friendId};
}