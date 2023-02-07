import 'package:client_leger/services/websocket_service.dart';
import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';

class ChatBoxController extends GetxController {
  final WebsocketService websocketService;

  ChatBoxController({required this.websocketService});

  TextEditingController textController = TextEditingController();

  void sendMessage() {
    print('sendmessage');
    if (!textController.text.isNotEmpty) {
      websocketService.sendMessage('broadcast', 'test button data');
    }
  }
}