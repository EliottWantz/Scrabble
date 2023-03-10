import 'package:client_leger/models/room.dart';

class ListJoinableGamesPayload {
  List<Room> games;

  ListJoinableGamesPayload(
      {required this.games});

  factory ListJoinableGamesPayload.fromJson(Map<String, dynamic> json) {
    return ListJoinableGamesPayload(
        games: json["games"]
    );
  }

  Map<String, dynamic> toJson() => {
    "games": games
  };
}