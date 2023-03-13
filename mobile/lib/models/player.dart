import 'package:client_leger/models/rack.dart';

class Player {
  String id;
  String username;
  Rack rack;
  int score;
  int consecutiveExchanges;
  bool isBot;

  Player({
    required this.id,
    required this.username,
    required this.rack,
    required this.score,
    required this.consecutiveExchanges,
    required this.isBot});

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      id: json["ID"],
      username: json["Username"],
      rack: Rack.fromJson(json["Rack"]),
      score: json["Score"],
      consecutiveExchanges: json["ConsecutiveExchanges"],
      isBot: json["IsBot"]);
  }

  Map<String, dynamic> toJson() => {
    "ID": id,
    "Username": username,
    "Rack": rack.toJson(),
    "Score": score,
    "ConsecutiveExchanges": consecutiveExchanges,
    "IsBot": isBot
  };
}