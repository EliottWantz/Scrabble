import 'package:client_leger/models/game.dart';
import 'package:client_leger/models/room.dart';

import 'game_room.dart';

class ObservableGamesPayload {
  List<Game> games;

  ObservableGamesPayload(
      {required this.games});

  factory ObservableGamesPayload.fromJson(Map<String, dynamic> json) {
    return ObservableGamesPayload(
        games: List<Game>.from((json["games"] as List).map(
                (game) => Game.fromJson(game))
        )
    );
  }

  Map<String, dynamic> toJson() => {
    "games": games
  };
}