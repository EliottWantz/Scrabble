import 'package:client_leger/controllers/chat_controller.dart';
import 'package:client_leger/controllers/friends_controller.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:get/get.dart';

import '../models/chat_message_payload.dart';

class ChatScreen extends GetView<ChatController> {
  ChatScreen({
    Key? key,
  }): super(key: key);

  // final List<String> messages = [
  //   'message1',
  //   'message2',
  //   'message3',
  //   'message4',
  //   'message5',
  //   'message6',
  //   'message7',
  //   'message8',
  //   'message9',
  //   'message10',
  //   'message1',
  //   'message2',
  //   'message3',
  //   'message4',
  //   'message5',
  //   'message6',
  //   'message7',
  //   'message8',
  //   'message9',
  //   'message10',
  // ];

  final ScrollController scrollController = ScrollController();

  void scrollDown() {
    scrollController.jumpTo(scrollController.position.maxScrollExtent);
  }

  @override
  Widget build(BuildContext context) {
    SchedulerBinding.instance.addPostFrameCallback((timeStamp) {
      scrollDown();
    });

    return Obx(() => Column(
      children: [
        Expanded(
          child: Center(
            child: ListView.builder(
              controller: scrollController,
                itemCount: controller.roomService.currentRoomMessages.value!.length,
              padding: const EdgeInsets.all(8),
              itemBuilder: (context, index) {
                return Container(
                  margin: EdgeInsets.only(bottom: 10),
                  padding: EdgeInsets.all(10),
                  height: 50,
                  color: Colors.amber[600],
                  child: Center(child: Text(controller.roomService.currentRoomMessages.value![index].message)),
                );
              }
            )
          )
        ),
        Container(
          margin: const EdgeInsets.all(8),
          padding: const EdgeInsets.all(8),
          child: const Center(child: Text('Your super cool Footer')),
          color: Colors.amber,
        )
      ]
    ));
  }
}