import 'package:client_leger/models/chat_room.dart';
import 'package:client_leger/models/room.dart';

class ListChatRoomsPayload {
  List<ChatRoom> chatRooms;

  ListChatRoomsPayload(
      {required this.chatRooms});

  factory ListChatRoomsPayload.fromJson(Map<String, dynamic> json) {
    return ListChatRoomsPayload(
        chatRooms: List<ChatRoom>.from((json["rooms"] as List).map(
                (chatRoom) => ChatRoom.fromJson(chatRoom))
        )
    );
  }

  Map<String, dynamic> toJson() => {
    "chatRooms": chatRooms
  };
}