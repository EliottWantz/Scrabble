import 'package:client_leger/models/chat_message_payload.dart';
import 'package:client_leger/models/public_user.dart';

class Room {
  String id;
  String name;
  List<PublicUser> users;
  List<ChatMessagePayload> messages;

  Room(
    {required this.id,
    required this.name,
    required this.users,
    required this.messages});

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json["id"],
      name: json["name"],
      users: List<PublicUser>.from((json["users"] as List).map(
              (user) => PublicUser.fromJson(user))
      ),
      messages: List<ChatMessagePayload>.from((json["messages"] as List).map(
          (message) => ChatMessagePayload.fromJson(message)
      ))
    );
  }

  Map<String, dynamic> toJson() => {
    "id": id,
    "name": name,
    "users": users.map((user) => user.toJson()).toList(),
    "messages": messages.map((message) => message.toString()).toList()
  };

}