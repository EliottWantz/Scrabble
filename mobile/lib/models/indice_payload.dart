import 'move_info.dart';

class IndicePayload {
  String gameId;

  IndicePayload({
    required this.gameId
  });

  factory IndicePayload.fromJson(Map<String, dynamic> json) {
    return IndicePayload(
        gameId: json["gameId"],
    );
  }

  Map<String, dynamic> toJson() => {
    "gameId": gameId,
  };
}