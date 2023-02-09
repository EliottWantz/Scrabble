import 'package:client_leger/services/websocket_service.dart';
import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';

import 'package:client_leger/services/storage_service.dart';

class ChatBoxController extends GetxController {
  final WebsocketService websocketService = Get.find();
  final StorageService storageService = Get.find();

  late RxInt itemCount = 0.obs;

  TextEditingController textController = TextEditingController();

  bool isCurrentUserMessage(String username) {
    return storageService.read('username') == username;
  }

  void sendMessage() {
    print('sendmessage');
    if (!textController.text.isNotEmpty) {
      websocketService.sendMessage('broadcast', 'test button data');
    }
  }
}