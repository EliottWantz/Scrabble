import 'package:client_leger/controllers/chat_controller.dart';
import 'package:client_leger/controllers/friends_controller.dart';
import 'package:client_leger/widgets/input_field.dart';
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

  final FocusNode messageInputFocusNode = FocusNode();

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
                  // height: 50,
                  // color: Colors.amber[600],
                  // child: Center(child: Text(controller.roomService.currentRoomMessages.value![index].message)),
                  child: Align(
                    alignment: (controller.isCurrentUser(controller
                        .roomService
                        .currentRoomMessages
                        .value![index]
                        .fromId)
                        ? Alignment.topRight
                        : Alignment.topLeft),
                    child: Container(
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                          color: (controller.isCurrentUser(controller
                              .roomService
                              .currentRoomMessages
                              .value![index]
                              .fromId)
                              ? Colors.amber[600]
                              : Colors.grey.shade200)
                      ),
                      padding: EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Text(
                            controller.roomService.currentRoomMessages.value![index].from
                          ),
                          Text(
                              controller.roomService.currentRoomMessages.value![index].message,
                              style: TextStyle(fontSize: 15),
                          ),
                        //   Text("implement timestamp function")
                        ],
                      ),
                  )),
                );
              }
            )
          )
        ),
        Container(
          margin: const EdgeInsets.all(8),
          padding: const EdgeInsets.all(8),
          // color: Colors.amber,
          // child: const Center(child: Text('Your super cool Footer')),
          child: TextField(
            controller: controller.messageController,
            keyboardType: TextInputType.text,
            focusNode: messageInputFocusNode,
            onSubmitted: (_) {
              controller.sendMessage();
              messageInputFocusNode.requestFocus();
            },
            decoration: const InputDecoration(
                hintText: "Entrez un message...",
                labelText: "Entrez un message...",
                border: OutlineInputBorder(
                    borderRadius:
                    BorderRadius.all(Radius.circular(8)))),
          ),
        )
      ]
    ));
  }
}