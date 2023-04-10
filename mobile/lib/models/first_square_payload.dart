import 'package:client_leger/models/position.dart';

class FirstSquarePayload {
  String gameId;
  Position coordinates;

  FirstSquarePayload({required this.gameId, required this.coordinates});

  factory FirstSquarePayload.fromJson(Map<String, dynamic> json) =>
      FirstSquarePayload(
          gameId: json["gameId"],
          coordinates: Position.fromJson(json["coordinates"]));

  Map<String, dynamic> toJson() => {
        "gameId": gameId,
        "coordinates": coordinates.toJson(),
      };
}
