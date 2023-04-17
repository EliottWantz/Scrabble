import 'package:client_leger/models/game.dart';
import 'package:client_leger/models/room.dart';

import 'game_room.dart';

class JoinableGamesPayload {
  List<Game> games;

  JoinableGamesPayload(
      {required this.games});

  factory JoinableGamesPayload.fromJson(Map<String, dynamic> json) {
    return JoinableGamesPayload(
        games: List<Game>.from((json["games"] as List).map(
            (game) => Game.fromJson(game))
      )
    );
  }

  Map<String, dynamic> toJson() => {
    "games": games
  };
}