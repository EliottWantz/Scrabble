import 'package:client_leger/models/chat_message_payload.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';

import 'package:client_leger/services/storage_service.dart';
import 'package:intl/intl.dart';

class ChatBoxController extends GetxController {
  final WebsocketService websocketService = Get.find();
  final StorageService storageService = Get.find();

  late RxInt itemCount = 0.obs;

  TextEditingController messageTextEditingController = TextEditingController();

  bool isCurrentUserMessage(String username) {
    return storageService.read('username') == username;
  }

  void sendMessage() {
  if (messageTextEditingController.text.isNotEmpty) {
      final chatMessagePayload = ChatMessagePayload(
          roomId: 'global',
          message: messageTextEditingController.text,
          from: storageService.read('username')
      );
      print('send message');
      print(chatMessagePayload);
      websocketService.sendMessage('broadcast', chatMessagePayload);
    }
  }

  @override
  void onClose() {
    super.onClose();
    messageTextEditingController.dispose();
  }
}