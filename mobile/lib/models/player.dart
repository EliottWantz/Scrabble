import 'package:client_leger/models/rack.dart';

class Player {
  String id;
  String username;
  Rack rack;
  int score;
  // int consecutiveExchanges;
  int consecutiveSkip;
  bool isBot;

  Player({
    required this.id,
    required this.username,
    required this.rack,
    required this.score,
    // required this.consecutiveExchanges,
    required this.consecutiveSkip,
    required this.isBot});

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      id: json["id"],
      username: json["username"],
      rack: Rack.fromJson(json["rack"]),
      score: json["score"],
      // consecutiveExchanges: json["consecutiveExchanges"],
        consecutiveSkip: json["consecutiveSkip"],
      isBot: json["isBot"]);
  }

  Map<String, dynamic> toJson() => {
    "ID": id,
    "Username": username,
    "Rack": rack.toJson(),
    "Score": score,
    // "ConsecutiveExchanges": consecutiveExchanges,
    "ConsecutiveSkip": consecutiveSkip,
    "IsBot": isBot
  };
}