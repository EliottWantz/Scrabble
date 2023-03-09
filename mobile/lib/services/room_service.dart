import 'package:client_leger/models/public_user.dart';
import 'package:get/get.dart';

import '../models/chat_message_payload.dart';
import '../models/room.dart';

class RoomService extends GetxService {
  Map<String, Room> rooms = <String, Room>{};

  void addRoom(String roomId, Room room) {
    rooms[roomId] = room;
  }

  Room getRoom(String roomId) {
    Room room = rooms[roomId]!;
    return room;
  }

  List<ChatMessagePayload> getRoomMessagesPayloads(String roomId) {
    List<ChatMessagePayload> messages = rooms[roomId]!.messages;
    return messages;
  }

  List<PublicUser> getRoomUsers(String roomId) {
    List<PublicUser> users = rooms[roomId]!.users;
    return users;
  }

  void addMessagePayloadToRoom(String roomId, ChatMessagePayload chatMessagePayload) {
    rooms[roomId]!.messages.add(chatMessagePayload);
  }
}