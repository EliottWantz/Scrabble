import 'package:client_leger/models/chat_message_payload.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';

import 'package:client_leger/services/storage_service.dart';
import 'package:intl/intl.dart';

class ChatBoxController extends GetxController {
  final WebsocketService websocketService = Get.find();
  final StorageService storageService = Get.find();
  final UserService userService = Get.find();
  final ScrollController scrollController = ScrollController();

  late RxInt itemCount = 0.obs;

  void scrollDown() {
    scrollController.jumpTo(scrollController.position.maxScrollExtent);
  }

  TextEditingController messageTextEditingController = TextEditingController();

  bool isCurrentUserMessage(String username) {
    return userService.user.value!.username == username;
  }

  String getLocalTime(int index) {
    final DateTime localDatetime = websocketService.messages.value[index].payload!.timestamp!.toLocal();
    return DateFormat("hh:mm:ss").format(localDatetime);
    // final int hour = localDatetime.hour;
    // final int minute = localDatetime.minute;
    // final int second = localDatetime.second;

    // DateTime localTimestamp = websocketService.messages.value[index].payload!.timestamp!.toLocal();
    // print(localTimestamp);
  }

  void sendMessage() {
  if (messageTextEditingController.text.isNotEmpty) {
      // final chatMessagePayload = ChatMessagePayload(
      //     roomId: 'global',
      //     message: messageTextEditingController.text,
      //     from: userService.user.value!.username
      // );
      // print('send message');
      // print(chatMessagePayload);
      // websocketService.sendMessage('broadcast', chatMessagePayload);
      messageTextEditingController.text = '';
    }
  }

  @override
  void onClose() {
    super.onClose();
    messageTextEditingController.dispose();
  }
}