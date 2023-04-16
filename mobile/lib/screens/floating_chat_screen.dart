import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:get_storage/get_storage.dart';
import 'package:giphy_picker/giphy_picker.dart';
import 'package:intl/intl.dart' as intl;

import '../controllers/chat_controller.dart';
import '../services/room_service.dart';

class FloatingChatScreen extends GetView<ChatController> {
  FloatingChatScreen(
    RxBool selectedChatRoom, {
    Key? key,
  })  : _selectedChatRoom = selectedChatRoom,
        super(key: key);

  Rx<GiphyGif?> _gif = null.obs;

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
                  color: Color.fromARGB(255, 98, 0, 238),
                ),
                child: TextButton(
                    onPressed: () =>
                        {_selectedChatRoom.value = !_selectedChatRoom.value},
                    child: const Text('Go back', style: TextStyle(color: Colors.white),),
                    style: ButtonStyle(
                      foregroundColor:
                          MaterialStatePropertyAll<Color>(Colors.black),
                    )),
              ),
            ),
            Expanded(
              child: Center(
                child: ListView.builder(
                  itemCount:
                      _roomService.currentFloatingRoomMessages.value!.length,
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
                              textDirection: controller.isCurrentUser(controller
                                      .roomService
                                      .currentFloatingRoomMessages
                                      .value![index]
                                      .fromId)
                                  ? TextDirection.rtl
                                  : TextDirection.ltr,
                              children: [
                                circularImageWithBorder(
                                    controller.isCurrentUser(controller
                                            .roomService
                                            .currentFloatingRoomMessages
                                            .value![index]
                                            .fromId)
                                        ? controller
                                            .userService.user.value!.avatar.url
                                        : controller.usersService
                                            .getUserById(controller
                                                .roomService
                                                .currentFloatingRoomMessages
                                                .value![index]
                                                .fromId)!
                                            .avatar
                                            .url),
                                Column(children: [
                                  Text(controller
                                      .roomService
                                      .currentFloatingRoomMessages
                                      .value![index]
                                      .from),
                                  Container(
                                    constraints: BoxConstraints(maxWidth: 180),
                                    decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(20),
                                        color: (controller.isCurrentUser(
                                                controller
                                                    .roomService
                                                    .currentFloatingRoomMessages
                                                    .value![index]
                                                    .fromId)
                                            ? Color.fromARGB(255, 98, 0, 238)
                                            : Colors.grey.shade200)),
                                    padding: EdgeInsets.all(16),
                                    child: Column(
                                      children: [
                                        // Text(
                                        //   controller.roomService.currentFloatingRoomMessages.value![index].from
                                        // ),
                                        _buildText(index),
                                        // Text(
                                        //   controller
                                        //       .roomService
                                        //       .currentFloatingRoomMessages
                                        //       .value![index]
                                        //       .message,
                                        //   style: TextStyle(fontSize: 15),
                                        // )
                                      ],
                                    ),
                                  ),
                                  Text(intl.DateFormat("hh:mm:ss").format(controller
                                      .roomService
                                      .currentRoomMessages
                                      .value![index]
                                      .timestamp!.toLocal())),
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
                    bottom: MediaQuery.of(context).viewInsets.bottom),
                child: Row(
                  children: [
                    SizedBox(
                      width: 220,
                      child: TextField(
                        controller: controller.messageController,
                        keyboardType: TextInputType.text,
                        focusNode: messageInputFocusNode,
                        onSubmitted: (_) {
                          controller.sendMessageToCurrentFloatingChatRoom();
                          messageInputFocusNode.requestFocus();
                        },
                        decoration: InputDecoration(
                            hintText: "Entrez un message...",
                            suffixIcon: IconButton(
                              icon: Icon(Icons.send),
                              onPressed: () {
                                controller.sendMessageToCurrentFloatingChatRoom();
                                messageInputFocusNode.requestFocus();
                              },
                            ),
                            suffixIconColor: Color.fromARGB(255, 98, 0, 238),
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.all(Radius.circular(8)))),
                      ),
                    ),
                    IconButton(
                      icon: Icon(Icons.gif_box, size: 40),
                      color: Color.fromARGB(255, 98, 0, 238),
                      onPressed: () async {
                        final gif = await GiphyPicker.pickGif(
                          context: context,
                          fullScreenDialog: false,
                          apiKey: 'xTfFWsRO0C50ULkBM1LYJ1aLk8olttNV',
                          showPreviewPage: true,
                          // decorator: GiphyDecorator(
                          //   showAppBar: false,
                          //   searchElevation: 4,
                          //   giphyTheme: ThemeData.dark(),
                          // ),
                        );
                        if (gif != null) {
                          // _gif.value = gif;
                          controller.messageController.text =
                          gif.images.original!.url!;
                          controller.sendMessageToCurrentFloatingChatRoom();
                          messageInputFocusNode.requestFocus();
                        }
                      },
                    )
                  ],
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

  Widget _buildText(int index) {
    if (controller.roomService.currentFloatingRoomMessages.value![index].message
        .startsWith('https://')) {
      return Image.network(
          controller.roomService.currentFloatingRoomMessages.value![index].message,
          headers: {'accept': 'image/*'});
    } else {
      return Text(controller.roomService.currentRoomMessages.value![index].message,
        style: TextStyle(
            fontSize: 15,
            color: controller.isCurrentUser(
                controller
                    .roomService
                    .currentRoomMessages
                    .value![index]
                    .fromId)
                ? Colors.white
                : Colors.black
        ),
      );
    }
  }
}
