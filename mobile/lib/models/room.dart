import 'package:client_leger/models/chat_message_payload.dart';
import 'package:client_leger/models/user.dart';

class Room {
  String roomId;
  String roomName;
  String? creatorId;
  List<User> users;
  List<ChatMessagePayload>? messages;
  bool? isGameRoom;


  Room(
    {required this.roomId,
    required this.roomName,
    required this.creatorId,
    required this.users,
    this.messages,
    this.isGameRoom});

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      roomId: json["id"],
      roomName: json["name"],
      creatorId: json["creatorId"],
      users: List<User>.from((json["userIds"] as List).map(
              (user) => User.fromJson(user))
      ),
      messages: List<ChatMessagePayload>.from((json["messages"] as List).map(
          (message) => ChatMessagePayload.fromJson(message)
      )),
      isGameRoom: json["isGameRoom"]
    );
  }

  Map<String, dynamic> toJson() => {
    "id": roomId,
    "name": roomName,
    "creatorId": creatorId,
    "users": users.map((user) => user.toJson()).toList(),
    "messages": messages?.map((message) => message.toJson()).toList(),
    "isGameRoom": isGameRoom,
  };

}