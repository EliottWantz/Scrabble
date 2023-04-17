import 'package:client_leger/models/game.dart';

class InvitedToGamePayload {
  Game game;
  String inviterId;

  InvitedToGamePayload({
    required this.game,
    required this.inviterId
  });

  factory InvitedToGamePayload.fromJson(Map<String, dynamic> json) => InvitedToGamePayload(
      game: Game.fromJson(json["username"]),
      inviterId: json["inviterId"]
  );

  Map<String, dynamic> toJson() => {
    "game": game,
    "inviterId": inviterId
  };
}