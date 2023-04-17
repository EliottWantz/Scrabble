import 'package:client_leger/models/chat_message_payload.dart';
import 'package:client_leger/models/user.dart';

class Room {
  String roomId;
  String roomName;
  // String? creatorId;
  List<String> userIds;
  List<ChatMessagePayload>? messages;
  // bool? isGameRoom;


  Room(
    {required this.roomId,
    required this.roomName,
    // required this.creatorId,
    required this.userIds,
    this.messages,
    // this.isGameRoom
    });

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      roomId: json["roomId"],
      roomName: json["roomName"],
      // creatorId: json["creatorId"],
      userIds: List<String>.from((json["userIds"] as List)),
      messages: List<ChatMessagePayload>.from((json["messages"] as List).map(
          (message) => ChatMessagePayload.fromJson(message)
      )),
      // isGameRoom: json["isGameRoom"]
    );
  }

  Map<String, dynamic> toJson() => {
    "id": roomId,
    "name": roomName,
    // "creatorId": creatorId,
    "userIds": userIds.toList(),
    "messages": messages?.map((message) => message.toJson()).toList(),
    // "isGameRoom": isGameRoom,
  };

}