class Game {
  String id;
  String creatorId;
  List<String> userIds;
  List<String> observateurIds;
  bool isPrivateGame;
  bool isProtected;

  Game(
      {required this.id,
        required this.creatorId,
        required this.userIds,
        required this.observateurIds,
        required this.isPrivateGame,
        required this.isProtected
      });

  factory Game.fromJson(Map<String, dynamic> json) {
    int userIdsIndex = 0;
    int observateurIdsIndex = 0;
    return Game(
        id: json["id"],
        creatorId: json["creatorId"],
        userIds: List<String>.from((json["userIds"] as List).map(
                (userId) => json["userIds"][userIdsIndex++]
        )),
        observateurIds: List<String>.from((json["observateurIds"] != null
            ? json["observateurIds"] as List : []).map(
                (userId) => json["observateurIds"][observateurIdsIndex++]
        )),
        isPrivateGame: json["isPrivateGame"],
        isProtected: json["isProtected"]
    );
  }

  Map<String, dynamic> toJson() => {
    "id": id,
    "creatorId": creatorId,
    "userIds": userIds,
    "observateurIds": observateurIds,
    "isPrivateGame": isPrivateGame,
    "isProtected": isProtected
  };
}