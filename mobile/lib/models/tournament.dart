import 'package:client_leger/models/game.dart';

class Tournament {
  String id;
  String creatorId;
  List<String> userIds;
  List<String> observateurIds;
  List<Game> poolGames;
  Game? finale;
  bool isOver;
  String winnerId;
  bool isPrivate;
  bool? isProtected;

  Tournament(
      {required this.id,
        required this.creatorId,
        required this.userIds,
        required this.observateurIds,
        required this.poolGames,
        required this.finale,
        required this.isOver,
        required this.winnerId,
        required this.isPrivate,
        required this.isProtected
      });

  factory Tournament.fromJson(Map<String, dynamic> json) {
    int userIdsIndex = 0;
    int observateurIdsIndex = 0;
    int poolGamesIndex = 0;
    return Tournament(
        id: json["id"],
        creatorId: json["creatorId"],
        userIds: List<String>.from((json["userIds"] as List).map(
                (userId) => json["userIds"][userIdsIndex++]
        )),
        observateurIds: List<String>.from((json["observateurIds"] != null
            ? json["observateurIds"] as List : []).map(
                (userId) => json["observateurIds"][observateurIdsIndex++]
        )),
        poolGames: List<Game>.from((json["poolGames"] as List).map(
            (poolGame) => json["poolGames"][poolGamesIndex++]
        )),
        finale: json["finale"],
        isOver: json["isOver"],
        winnerId: json["winnerId"],
        isPrivate: json["isPrivate"],
        isProtected: json["isProtected"]
    );
  }

  Map<String, dynamic> toJson() => {
    "id": id,
    "creatorId": creatorId,
    "userIds": userIds,
    "observateurIds": observateurIds,
    "poolGames": poolGames,
    "finale": finale,
    "isOver": isOver,
    "winnerId": winnerId,
    "isPrivate": isPrivate,
    "isProtected": isProtected
  };
}