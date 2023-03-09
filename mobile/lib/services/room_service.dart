import 'dart:core';
import 'dart:math';

import 'package:client_leger/models/public_user.dart';
import 'package:get/get.dart';

import '../models/chat_message_payload.dart';
import '../models/room.dart';

class RoomService extends GetxService {
  RxMap<String, Room> roomsMap = RxMap<String, Room>();
  final currentRoomMessages = <ChatMessagePayload>[].obs;
  // final currentRoomMessages = List<ChatMessagePayload>().obs;

  var currentRoomId = 'global';

  void updateCurrentRoomId(String newCurrentRoomId) {
    currentRoomId = newCurrentRoomId;
    print('Current room id is $currentRoomId');
  }

  void updateCurrentRoomMessages() {
    currentRoomMessages.clear();
    currentRoomMessages.addAll(getCurrentRoomChatMessagePayloads());
  }

  List<ChatMessagePayload> getCurrentRoomChatMessagePayloads() {
    return getCurrentRoom().messages;
  }

  Map<String, Room> getMapOfRoomsByIds() {
    return roomsMap;
  }

  List<Room> getRooms() {
    List<Room> rooms = [];
    roomsMap.forEach((roomId, room) {
      rooms.add(room);
    });
    return rooms;
  }

  List<String> getRoomNames() {
    List<String> roomNames = [];
    roomsMap.forEach((roomId, room) {
      roomNames.add(room.roomName);
    });
    return roomNames;
  }

  List<String> getRoomIds() {
    List<String> roomIds = [];
    roomsMap.forEach((roomId, room) {
      roomIds.add(room.roomName);
    });
    return roomIds;
  }

  Room getCurrentRoom() {
    return roomsMap[currentRoomId]!;
  }

  Room getRoom(String roomId) {
    Room room = roomsMap[roomId]!;
    return room;
  }

  List<ChatMessagePayload> getRoomMessagesPayloads(String roomId) {
    List<ChatMessagePayload> messages = roomsMap[roomId]!.messages;
    return messages;
  }

  List<PublicUser> getRoomUsers(String roomId) {
    List<PublicUser> users = roomsMap[roomId]!.users;
    return users;
  }

  void addMessagePayloadToRoom(String roomId, ChatMessagePayload chatMessagePayload) {
    roomsMap.value[roomId]!.messages.add(chatMessagePayload);
  }

  void addRoom(String roomId, Room room) {
    roomsMap[roomId] = room;
  }
}