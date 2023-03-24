import 'package:client_leger/models/position.dart';
import 'package:client_leger/models/tile.dart';

class TileInfo {
  Tile tile;
  Position position;

  TileInfo({required this.tile, required this.position});

  factory TileInfo.fromJson(Map<String, dynamic> json) {
    return TileInfo(
        tile: Tile.fromJson(json["tile"]),
        position: Position.fromJson(json["position"]));
  }
}
