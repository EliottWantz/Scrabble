class GameRoom {
  String id;
  String name;
  List<dynamic> usersIds;

  GameRoom(
      {required this.id,
        required this.name,
        required this.usersIds,
        });

  factory GameRoom.fromJson(Map<String, dynamic> json) {
    return GameRoom(
        id: json["ID"],
        name: json["Name"],
        usersIds: List<dynamic>.from((json["UserIDs"] as List).map(
                (userId) => json[userId])
        )
    );
  }

  Map<String, dynamic> toJson() => {
    "id": id,
    "name": name,
    "usersIds": usersIds,
  };

}