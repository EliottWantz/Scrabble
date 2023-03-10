class GameRoom {
  String id;
  String name;
  List<String> usersIds;

  GameRoom(
      {required this.id,
        required this.name,
        required this.usersIds,
        });

  factory GameRoom.fromJson(Map<String, dynamic> json) {
    int index = 0;
    return GameRoom(
        id: json["ID"],
        name: json["Name"],
        usersIds: List<String>.from((json["UserIDs"] as List).map(
                (userId) => json["UserIDs"][index++]
                )
        )
    );
  }

  Map<String, dynamic> toJson() => {
    "id": id,
    "name": name,
    "usersIds": usersIds,
  };

}