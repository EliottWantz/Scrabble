import 'dart:convert';

class AcceptJoinGameRequest {
  AcceptJoinGameRequest({required this.userId, required this.gameId});

  String userId;
  String gameId;

  factory AcceptJoinGameRequest.fromRawJson(String str) =>
      AcceptJoinGameRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory AcceptJoinGameRequest.fromJson(Map<String, dynamic> json) =>
      AcceptJoinGameRequest(userId: json["userId"], gameId: json["gameId"]);

  Map<String, dynamic> toJson() => {"userId": userId, "gameId": gameId};
}