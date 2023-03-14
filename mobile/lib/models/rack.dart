import 'package:client_leger/models/tile.dart';

class Rack {
  List<Tile> tiles;

  Rack({required this.tiles});

  factory Rack.fromJson(Map<String, dynamic> json) {
    return Rack(
      tiles: List<Tile>.from((json["tiles"] as List).map(
              (tile) => Tile.fromJson(tile))
      )
    );
  }

  Map<String, dynamic> toJson() => {
    "tiles": tiles.map((tile) => tile.toJson()).toList()
  };
}