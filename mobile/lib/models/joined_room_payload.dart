import 'package:client_leger/models/chat_message_payload.dart';
import 'package:client_leger/models/user.dart';

class JoinedRoomPayload {
  String roomId;
  String roomName;
  List<User> users;
  List<ChatMessagePayload> messages;

  JoinedRoomPayload(
      {required this.roomId,
        required this.roomName,
        required this.users,
        required this.messages});

  factory JoinedRoomPayload.fromJson(Map<String, dynamic> json) {
    return JoinedRoomPayload(
        roomId: json["roomId"],
        roomName: json["roomName"],
        users: List<User>.from((json["users"] as List).map(
                (user) => User.fromJson(user))
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