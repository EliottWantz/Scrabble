import 'dart:core';
import 'dart:math';

import 'package:client_leger/models/chat_room.dart';
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

  final RxList<ChatRoom> listedChatRooms = <ChatRoom>[].obs;

  List<dynamic> newRoomUserIds = [];

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
    currentFloatingRoomMessages.addAll(getCurrentFloatingRoomChatMessagePayloads());
  }

  List<ChatMessagePayload> getCurrentRoomChatMessagePayloads() {
    return getCurrentRoom().messages!;
  }

  List<ChatMessagePayload> getCurrentFloatingRoomChatMessagePayloads() {
    Room currentFloatingRoom = getCurrentFloatingRoom();
    if (currentFloatingRoom.messages != null) {
      return getCurrentFloatingRoom().messages!;
    }
    return <ChatMessagePayload>[];
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

  String getRoomIdByRoomName(String roomName) {
    String roomId = '';
    roomsMap.forEach((roomId, room) {
      if (room.roomName == roomName) {
        roomId = room.roomId;
      }
    });
    return roomId;
  }

  List<String> getListedChatRoomNames() {
    List<String> chatRoomNames = [];
    listedChatRooms.forEach((room) {
      chatRoomNames.add(room.name);
    });
    return chatRoomNames;
  }

  List<String> getListedChatRoomIds() {
    List<String> chatRoomIds = [];
    listedChatRooms.forEach((room) {
      chatRoomIds.add(room.id);
    });
    return chatRoomIds;
  }

  Room getCurrentRoom() {
    return roomsMap[currentRoomId]!;
  }

  Room getCurrentFloatingRoom() {
    return roomsMap[currentFloatingChatRoomId.value]!;
  }

  Room getRoom(String roomId) {
    Room room = roomsMap[roomId]!;
    return room;
  }

  String getListedChatRoomNameById(String chatRoomId) {
    for (ChatRoom chatRoom in listedChatRooms) {
      if (chatRoom.id == chatRoomId) {
        return chatRoom.name;
      }
    }
    return '';
  }

  String getListedChatRoomIdByName(String chatRoomName) {
    for (ChatRoom chatRoom in listedChatRooms) {
      if (chatRoom.name == chatRoomName) {
        return chatRoom.id;
      }
    }
    return '';
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

  void removeRoom(String roomId) {
    roomsMap.value!.remove(roomId);
  }

  bool roomMapContains(String roomName) {
    bool roomMapContainsRoomName = false;
    roomsMap.forEach((roomId, room) {
      if (room.roomName == roomName) {
        roomMapContainsRoomName = true;
      }
    });
    return roomMapContainsRoomName;
  }
}