import 'dart:convert';

import 'package:client_leger/models/avatar.dart';

class NetworkLogs {
  String eventType;
  int eventTime;

  NetworkLogs({required this.eventTime, required this.eventType});

  factory NetworkLogs.fromJson(Map<String, dynamic> json) => NetworkLogs(
        eventType: json["eventType"],
        eventTime: json["eventTime"],
      );

  Map<String, dynamic> toJson() => {
        "eventType": eventType,
        "eventTime": eventTime,
      };
}

class GamesStats {
  int eventDate;
  bool? gameWon;

  GamesStats({required this.eventDate, this.gameWon});

  factory GamesStats.fromJson(Map<String, dynamic> json) => GamesStats(
        eventDate: json["eventDate"],
        gameWon: json["gameWon"],
      );

  Map<String, dynamic> toJson() => {
        "eventDate": eventDate,
        "gameWon": gameWon,
      };
}

class UserStats {
  int? nbGamesPlayed;
  int? nbGamesWon;
  int? averagePointsPerGame;
  int? averageTimePlayed;

  UserStats(
      {this.nbGamesPlayed,
      this.averagePointsPerGame,
      this.averageTimePlayed,
      this.nbGamesWon});

  factory UserStats.fromJson(Map<String, dynamic> json) => UserStats(
      nbGamesPlayed: json["nbGamesPlayed"],
      nbGamesWon: json["nbGamesWon"],
      averagePointsPerGame: json["averagePointsPerGame"],
      averageTimePlayed: json["averageTimePlayed"]);

  Map<String, dynamic> toJson() => {
        "nbGamesPlayed": nbGamesPlayed,
        "nbGamesWon": nbGamesWon,
        "averagePointsPerGame": averagePointsPerGame,
        "averageTimePlayed": averageTimePlayed,
      };
}

class Summary {
  List<NetworkLogs>? networkLogs;
  List<GamesStats>? gamesStats;
  UserStats? userStats;

  Summary({this.userStats, this.gamesStats, this.networkLogs});

  factory Summary.fromJson(Map<String, dynamic> json) => Summary(
        userStats: UserStats.fromJson(json["userStats"]),
    gamesStats: json["gamesStats"] != null
            ? List<GamesStats>.from((json["gamesStats"] as List)
                .map((gameStat) => GamesStats.fromJson(gameStat)))
            : <GamesStats>[],
        networkLogs: json["networkLogs"] != null
            ? List<NetworkLogs>.from((json["networkLogs"] as List)
                .map((networkLog) => NetworkLogs.fromJson(networkLog)))
            : <NetworkLogs>[],
      );

  Map<String, dynamic> toJson() => {
        "userStats": userStats?.toJson(),
        "gamesStats": gamesStats,
        "networkLogs": networkLogs,
      };
}

class Preferences {
  String theme;
  String language;

  Preferences({required this.theme, required this.language});

  factory Preferences.fromJson(Map<String, dynamic> json) => Preferences(
        theme: json["theme"],
        language: json["language"],
      );

  Map<String, dynamic> toJson() => {
        "theme": theme,
        "language": language,
      };
}

class User {
  String id;
  String username;
  String email;
  Avatar avatar;
  Summary summary;
  Preferences preferences;
  String joinedGame;
  List<dynamic> joinedChatRooms;
  List<dynamic> friends;

  User(
      {required this.id,
      required this.username,
      required this.email,
      required this.avatar,
      required this.joinedGame,
      required this.summary,
      required this.preferences,
      required this.joinedChatRooms,
      required this.friends});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
        id: json["id"],
        summary: Summary.fromJson(json["summary"]),
        username: json["username"],
        email: json["email"],
        joinedGame: json["joinedGame"],
        avatar: Avatar.fromJson(json["avatar"]),
        preferences: Preferences.fromJson(json["preferences"]),
        joinedChatRooms: json["joinedChatRooms"],
        friends: json["friends"]);
  }

  Map<String, dynamic> toJson() => {
        "id": id,
        "username": username,
        "email": email,
        "joinedGame": joinedGame,
        "summary": summary.toJson(),
        "avatar": avatar.toJson(),
        "preferences": preferences.toJson(),
        "joinedChatRooms": joinedChatRooms,
        "friends": friends
      };
}
