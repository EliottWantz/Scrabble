import 'package:client_leger/models/game.dart';
import 'package:client_leger/models/room.dart';
import 'package:client_leger/models/tournament.dart';

import 'game_room.dart';

class JoinableTournamentsPayload {
  List<Tournament> tournaments;

  JoinableTournamentsPayload(
      {required this.tournaments});

  factory JoinableTournamentsPayload.fromJson(Map<String, dynamic> json) {
    return JoinableTournamentsPayload(
        tournaments: List<Tournament>.from((json["tournaments"] as List).map(
                (tournament) => Tournament.fromJson(tournament))
        )
    );
  }

  Map<String, dynamic> toJson() => {
    "tournaments": tournaments
  };
}