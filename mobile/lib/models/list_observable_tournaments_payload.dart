import 'package:client_leger/models/game.dart';
import 'package:client_leger/models/room.dart';
import 'package:client_leger/models/tournament.dart';

import 'game_room.dart';

class ObservableTournamentsPayload {
  List<Tournament> tournaments;

  ObservableTournamentsPayload(
      {required this.tournaments});

  factory ObservableTournamentsPayload.fromJson(Map<String, dynamic> json) {
    return ObservableTournamentsPayload(
        tournaments: List<Tournament>.from((json["tournaments"] as List).map(
                (tournament) => Tournament.fromJson(tournament))
        )
    );
  }

  Map<String, dynamic> toJson() => {
    "tournaments": tournaments
  };
}