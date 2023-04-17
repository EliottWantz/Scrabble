import 'package:client_leger/controllers/chat_controller.dart';
import 'package:client_leger/controllers/friends_controller.dart';
import 'package:client_leger/widgets/input_field.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:get/get.dart';
import 'package:giphy_picker/giphy_picker.dart';
import 'package:intl/intl.dart' as intl;

import '../models/chat_message_payload.dart';

class ChatScreen extends GetView<ChatController> {
  ChatScreen({
    Key? key,
  }) : super(key: key);

  Rx<GiphyGif?> _gif = null.obs;

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

    return Obx(() => Column(children: [
              _buildChatScreenHeader(),
              Expanded(
                  child: Center(
                      child: ListView.builder(
                          controller: scrollController,
                          itemCount: controller
                              .roomService.currentRoomMessages.value!.length,
                          padding: const EdgeInsets.all(8),
                          itemBuilder: (context, index) {
                            return Container(
                              margin: EdgeInsets.only(bottom: 10),
                              padding: EdgeInsets.all(10),
                              // height: 50,
                              // color: Colors.amber[600],
                              // child: Center(child: Text(controller.roomService.currentRoomMessages.value![index].message)),
                              child: Align(
                                  alignment: (controller.isCurrentUser(
                                          controller
                                              .roomService
                                              .currentRoomMessages
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
                                      // mainAxisAlignment: controller.isCurrentUser(
                                      //         controller
                                      //             .roomService
                                      //             .currentRoomMessages
                                      //             .value![index]
                                      //             .fromId)
                                      //     ? MainAxisAlignment.end
                                      //     : MainAxisAlignment.start,
                                      // crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        circularImageWithBorder(
                                            controller.isCurrentUser(controller
                                                    .roomService
                                                    .currentRoomMessages
                                                    .value![index]
                                                    .fromId)
                                                ? controller.userService.user
                                                    .value!.avatar.url
                                                : controller.usersService
                                                    .getUserById(controller
                                                        .roomService
                                                        .currentRoomMessages
                                                        .value![index]
                                                        .fromId)!
                                                    .avatar
                                                    .url),
                                        Column(
                                          // crossAxisAlignment:
                                          //     controller.isCurrentUser(controller
                                          //             .roomService
                                          //             .currentRoomMessages
                                          //             .value![index]
                                          //             .fromId)
                                          //         ? CrossAxisAlignment.end
                                          //         : CrossAxisAlignment.start,
                                          children: [
                                            Text(controller
                                                .roomService
                                                .currentRoomMessages
                                                .value![index]
                                                .from),
                                            Container(
                                              constraints:
                                                  BoxConstraints(maxWidth: 810),
                                              decoration: BoxDecoration(
                                                  borderRadius:
                                                      BorderRadius.circular(20),
                                                  color: (controller.isCurrentUser(
                                                          controller
                                                              .roomService
                                                              .currentRoomMessages
                                                              .value![index]
                                                              .fromId)
                                                      ? Color.fromARGB(255, 98, 0, 238)
                                                      : Colors.grey.shade200)),
                                              padding: EdgeInsets.all(16),
                                              child: Column(
                                                children: [
                                                  // Text(
                                                  //   controller.roomService.currentRoomMessages.value![index].from
                                                  // ),
                                                  _buildText(index),
                                                  //   Text("implement timestamp function")
                                                ],
                                              ),
                                            ),
                                            Text(intl.DateFormat("hh:mm:ss").format(controller
                                                .roomService
                                                .currentRoomMessages
                                                .value![index]
                                                .timestamp!.toLocal())),
                                          ],
                                        )
                                      ])),
                            );
                          }))),
              Container(
                margin: const EdgeInsets.all(8),
                padding: const EdgeInsets.all(8),
                // color: Colors.amber,
                // child: const Center(child: Text('Your super cool Footer')),
                child: Row(
                  children: [
                    SizedBox(
                      width: 845,
                      child: TextField(
                        controller: controller.messageController,
                        keyboardType: TextInputType.text,
                        focusNode: messageInputFocusNode,
                        onSubmitted: (_) {
                          controller.sendMessage();
                          messageInputFocusNode.requestFocus();
                        },
                        decoration: InputDecoration(
                            hintText: "chat-screen.message-hint".tr,
                            suffixIcon: IconButton(
                              icon: Icon(Icons.send),
                              onPressed: () {
                                controller.sendMessage();
                                messageInputFocusNode.requestFocus();
                              },
                            ),
                            suffixIconColor: Color.fromARGB(255, 98, 0, 238),
                            border: OutlineInputBorder(
                                borderRadius:
                                    BorderRadius.all(Radius.circular(8)))),
                      ),
                    ),
                    IconButton(
                      icon: Icon(Icons.gif_box, size: 50),
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
                          controller.sendMessage();
                          messageInputFocusNode.requestFocus();
                        }
                      },
                    )
                  ],
                ),
              )
            ])
    );
  }

  Widget _buildChatScreenHeader() {
    if (controller.roomService
            .getRoomNameByRoomId(controller.roomService.currentRoomId)
            .contains('/') ||
        controller.roomService.currentRoomId == 'global') {
      return const SizedBox(height: 0, width: 0);
    } else {
      return Row(
        children: [
          Padding(
            padding: EdgeInsets.all(16),
            child: ElevatedButton.icon(
              onPressed: () {
                controller.websocketService
                    .leaveChatRoom(controller.roomService.currentRoomId);
              },
              icon: const Icon(Icons.exit_to_app, size: 50),
              label: Text('chat-screen.quit-channel'.tr),
            ),
          )
        ],
      );
    }
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
    if (controller.roomService.currentRoomMessages.value![index].message
        .contains('giphy.com')) {
      return Image.network(
          controller.roomService.currentRoomMessages.value![index].message,
          headers: {'accept': 'image/*'});
    } else {
      return Text(
        controller.roomService.currentRoomMessages.value![index].message,
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
