import 'dart:core';
import 'dart:math';

import 'package:get/get.dart';

import '../models/chat_message_payload.dart';
import '../models/room.dart';
import '../models/user.dart';

class RoomService extends GetxService {
  RxMap<String, Room> roomsMap = RxMap<String, Room>();
  final currentRoomMessages = <ChatMessagePayload>[].obs;
  final currentFloatingRoomMessages = <ChatMessagePayload>[].obs;
  // final currentRoomMessages = List<ChatMessagePayload>().obs;

  var currentRoomId = 'global';
  final currentFloatingChatRoomId = Rxn<String>();

  void updateCurrentRoomId(String newCurrentRoomId) {
    currentRoomId = newCurrentRoomId;
    print('Current room id is $currentRoomId');
  }

  void updateCurrentRoomMessages() {
    currentRoomMessages.clear();
    currentRoomMessages.addAll(getCurrentRoomChatMessagePayloads());
  }

  void updateCurrentFloatingRoomMessages() {
    currentFloatingRoomMessages.clear();
    currentFloatingRoomMessages.addAll(getCurrentRoomChatMessagePayloads());
  }

  List<ChatMessagePayload> getCurrentRoomChatMessagePayloads() {
    return getCurrentRoom().messages!;
  }

  List<ChatMessagePayload> getCurrentFloatingRoomChatMessagePayloads() {
    return getCurrentFloatingRoom().messages!;
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

  Room getCurrentFloatingRoom() {
    return roomsMap[currentFloatingChatRoomId]!;
  }

  Room getRoom(String roomId) {
    Room room = roomsMap[roomId]!;
    return room;
  }

  List<ChatMessagePayload> getRoomMessagesPayloads(String roomId) {
    List<ChatMessagePayload> messages = roomsMap[roomId]!.messages!;
    return messages;
  }

  // List<User> getRoomUsers(String roomId) {
  //   List<User> users = roomsMap[roomId]!.users;
  //   return users;
  // }

  void addMessagePayloadToRoom(String roomId, ChatMessagePayload chatMessagePayload) {
    roomsMap.value[roomId]!.messages!.add(chatMessagePayload);
  }

  void addRoom(String roomId, Room room) {
    roomsMap[roomId] = room;
  }
}