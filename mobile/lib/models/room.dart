import 'package:client_leger/models/chat_message_payload.dart';
import 'package:client_leger/models/public_user.dart';

class Room {
  String roomId;
  String roomName;
  List<PublicUser> users;
  List<ChatMessagePayload> messages;

  Room(
    {required this.roomId,
    required this.roomName,
    required this.users,
    required this.messages});

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      roomId: json["roomId"],
      roomName: json["roomName"],
      users: List<PublicUser>.from((json["users"] as List).map(
              (user) => PublicUser.fromJson(user))
      ),
      messages: List<ChatMessagePayload>.from((json["messages"] as List).map(
          (message) => ChatMessagePayload.fromJson(message)
      ))
    );
  }

  Map<String, dynamic> toJson() => {
    "id": roomId,
    "name": roomName,
    "users": users.map((user) => user.toJson()).toList(),
    "messages": messages.map((message) => message.toJson()).toList()
  };

}