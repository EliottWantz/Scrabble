import 'package:client_leger/models/player.dart';
import 'package:client_leger/models/square.dart';

class GameUpdatePayload {
  String id;
  List<Player> players;
  List<List<Square>> board;
  bool? finished;
  int? tileCount;
  String turn;
  // duration;

  GameUpdatePayload({
    required this.id,
    required this.players,
    required this.board,
    required this.finished,
    this.tileCount,
    required this.turn});

  factory GameUpdatePayload.fromJson(Map<String, dynamic> json) {
    return GameUpdatePayload(
        id: json["id"],
        players: List<Player>.from((json["players"] as List).map(
            (player) => Player.fromJson(player))
        ),
        board: List<List<Square>>.from((json["board"] as List).map(
                (row) => List<Square>.from((row as List).map((square) => Square.fromJson(square))))
        ),
        // board: json["game"]["board"],
        finished: json["finished"],
        tileCount: json["tileCount"],
        turn: json["turn"]
    );
  }

  Map<String, dynamic> toJson() => {
    "id": id,
    "players": players.map((player) => player.toJson()).toList(),
    "board": board.map((row) => (row.map((square) => square.toJson()).toList())).toList(),
    "finished": finished,
    "tileCount": tileCount,
    "turn": turn
  };
}