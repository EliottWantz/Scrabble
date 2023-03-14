import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';

import '../models/chat_message_payload.dart';
import '../services/room_service.dart';

class ChatController extends GetxController {
  final RoomService roomService = Get.find();
  final UserService userService = Get.find();
  final WebsocketService websocketService = Get.find();
  final GameService gameService = Get.find();

  final messageController = TextEditingController();

  late RxList<ChatMessagePayload> messages = <ChatMessagePayload>[].obs;

  void sendMessage() {
    websocketService.sendMessage(roomService.currentRoomId, messageController.text);
    messageController.text = '';
  }

  void sendMessageToGameRoom() {
    websocketService.sendMessage(gameService.currentGameRoom.value!.roomId, messageController.text);
    messageController.text = '';
  }

  bool isCurrentUser(String userId) {
    return userId == userService.user.value!.id;
  }

  // ChatController() {
  //   messages.listen((p0) {print('message from constructor');});
  // }
  //
  // @override
  // void onInit() {
  //   // TODO: implement onInit
  //   messages.listen((p0) {print('messages have changed');});
  //   super.onInit();
  // }
}