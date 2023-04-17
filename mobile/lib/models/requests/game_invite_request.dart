import 'dart:convert';

class GameInviteRequest {
  GameInviteRequest({required this.invitedId, required this.inviterId, required this.gameId});

  String invitedId;
  String inviterId;
  String gameId;

  factory GameInviteRequest.fromRawJson(String str) =>
      GameInviteRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory GameInviteRequest.fromJson(Map<String, dynamic> json) =>
      GameInviteRequest(
          invitedId: json["invitedId"],
          inviterId: json["inviterId"],
          gameId: json["gameId"]
      );

  Map<String, dynamic> toJson() => {
    "invitedId": invitedId,
    "inviterId": inviterId,
    "gameId": gameId
  };
}
