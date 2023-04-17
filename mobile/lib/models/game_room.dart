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
        id: json["id"],
        name: json["name"],
        usersIds: List<String>.from((json["userIds"] as List).map(
                (userId) => json["userIds"][index++]
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