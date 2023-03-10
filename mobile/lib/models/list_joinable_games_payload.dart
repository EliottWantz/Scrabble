import 'package:client_leger/models/room.dart';

import 'game_room.dart';

class ListJoinableGamesPayload {
  List<GameRoom> games;

  ListJoinableGamesPayload(
      {required this.games});

  factory ListJoinableGamesPayload.fromJson(Map<String, dynamic> json) {
    return ListJoinableGamesPayload(
        games: List<GameRoom>.from((json["games"] as List).map(
            (gameRoom) => GameRoom.fromJson(gameRoom))
      )
    );
  }

  Map<String, dynamic> toJson() => {
    "games": games
  };
}