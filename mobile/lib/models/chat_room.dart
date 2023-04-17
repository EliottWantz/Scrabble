class ChatRoom {
  String id;
  String name;
  List<String> userIds;
  // bool? isGameRoom;


  ChatRoom(
      {required this.id,
        required this.name,
        required this.userIds,
      });

  factory ChatRoom.fromJson(Map<String, dynamic> json) {
    return ChatRoom(
      id: json["id"],
      name: json["name"],
      userIds: List<String>.from((json["userIds"] as List)),
    );
  }

  Map<String, dynamic> toJson() => {
    "id": id,
    "name": name,
    "userIds": userIds.toList(),
  };

}