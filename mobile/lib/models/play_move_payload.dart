import 'move_info.dart';

class PlayMovePayload {
  String gameId;
  MoveInfo moveInfo;

  PlayMovePayload({
    required this.gameId,
    required this.moveInfo});

  factory PlayMovePayload.fromJson(Map<String, dynamic> json) {
    return PlayMovePayload(
        gameId: json["gameId"],
        moveInfo: json["moveInfo"]
    );
  }

  Map<String, dynamic> toJson() => {
    "gameId": gameId,
    "moveInfo": moveInfo.toJson()
  };
}