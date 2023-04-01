import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:get_storage/get_storage.dart';

import '../controllers/chat_controller.dart';
import '../services/room_service.dart';

class FloatingChatScreen extends GetView<ChatController> {
  FloatingChatScreen(RxBool selectedChatRoom, {
    Key? key,
  }) : _selectedChatRoom = selectedChatRoom,
        super(key: key);

  final RoomService _roomService = Get.find();

  final FocusNode messageInputFocusNode = FocusNode();

  // final args = Get.arguments;
  final RxBool _selectedChatRoom;

  @override
  Widget build(BuildContext context) {
    // return Scaffold(
    //   body: Container(
    //     alignment: Alignment.center,
    //     child: Text(args['text']),
    //   ),
    // );
    return Obx(() => Column(
      children: [
        Container(
          height: 100,
          width: double.infinity,
          child: DrawerHeader(
            decoration: const BoxDecoration(
              color: Colors.blue,
            ),
            child: TextButton(
              onPressed: () => { _selectedChatRoom.value = !_selectedChatRoom.value},
              child: const Text('Go back'),
            ),
          ),
        ),
        Expanded(
          child: Center(
            child: ListView.builder(
              itemCount: _roomService.currentFloatingRoomMessages.value!.length,
              padding: const EdgeInsets.all(8),
              itemBuilder: (context, index) {
                return Container(
                  margin: EdgeInsets.only(bottom: 10),
                  padding: EdgeInsets.all(10),
                  child: Align(
                    alignment: (controller.isCurrentUser(controller
                        .roomService
                        .currentFloatingRoomMessages
                        .value![index]
                        .fromId)
                        ? Alignment.topRight
                        : Alignment.topLeft),
                    child: Row(
                        textDirection: controller.isCurrentUser(
                            controller
                                .roomService
                                .currentRoomMessages
                                .value![index]
                                .fromId)
                            ? TextDirection.rtl
                            : TextDirection.ltr,
                      children: [
                        circularImageWithBorder(controller
                            .usersService
                            .getUserById(controller
                            .roomService
                            .currentRoomMessages
                            .value![index]
                            .fromId)!
                            .avatar
                            .url),
                        Column(
                          children: [
                        Text(
                        controller.roomService.currentFloatingRoomMessages.value![index].from
                        ),
                            Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            color: (controller.isCurrentUser(controller
                                .roomService
                                .currentFloatingRoomMessages
                                .value![index]
                                .fromId)
                                ? Colors.amber[600]
                                : Colors.grey.shade200)
                            ),
                          padding: EdgeInsets.all(16),
                          child: Column(
                            children: [
                              // Text(
                              //   controller.roomService.currentFloatingRoomMessages.value![index].from
                              // ),
                              Text(
                                controller.roomService.currentFloatingRoomMessages.value![index].message,
                                style: TextStyle(fontSize: 15),
                              )
                            ],
                          ),
                      ),
                        ]),
                    ])),
                );
              },
            ),
          ),
        ),
        Container(
          margin: const EdgeInsets.all(8),
          padding: const EdgeInsets.all(8),
          child: Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom
            ),
            child: TextField(
              controller: controller.messageController,
              keyboardType: TextInputType.text,
              focusNode: messageInputFocusNode,
              onSubmitted: (_) {
                controller.sendMessageToCurrentFloatingChatRoom();
                messageInputFocusNode.requestFocus();
              },
              decoration: const InputDecoration(
                  hintText: "Entrez un message...",
                  border: OutlineInputBorder(
                      borderRadius:
                      BorderRadius.all(Radius.circular(8)))
              ),
            ),
          ),
        )
      ],
    ));
  }

  Widget circularImageWithBorder(String imgPath) {
    return Container(
      width: 50.0,
      height: 50.0,
      decoration: BoxDecoration(
          color: const Color(0xff7c94b6),
          image: DecorationImage(
            image: NetworkImage(imgPath),
            fit: BoxFit.cover,
          ),
          borderRadius: const BorderRadius.all(Radius.circular(25.0))),
    );
  }
}
