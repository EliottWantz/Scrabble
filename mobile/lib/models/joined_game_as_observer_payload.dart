import 'package:client_leger/models/game.dart';
import 'package:client_leger/models/game_update_payload.dart';

class JoinedGameAsObserverPayload {
  Game game;
  GameUpdatePayload gameUpdate;

  JoinedGameAsObserverPayload({required this.game, required this.gameUpdate});

  factory JoinedGameAsObserverPayload.fromJson(Map<dynamic, dynamic> json) => JoinedGameAsObserverPayload(
      game: Game.fromJson(json["game"]),
      gameUpdate: GameUpdatePayload.fromJson(json["gameUpdate"])
  );

  Map<String, dynamic> toJson() => {
    "game": game,
    "gameUpdate": gameUpdate
  };
}