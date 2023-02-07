import 'package:chat_bubbles/chat_bubbles.dart';
import 'package:client_leger/controllers/chatbox_controller.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:client_leger/widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ChatBox extends GetView<ChatBoxController> {
  const ChatBox({super.key});

  // WebsocketService chatController = Get.put(WebsocketService());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: false,
        body: SingleChildScrollView(
      child: Column(
        children: [
          Form(
            child: TextFormField(controller: controller.textController),
            ),
          StreamBuilder(
              stream: controller.websocketService.socket.stream,
              builder: (context,snapshot){
                return Text(snapshot.hasData ? '${snapshot.data}' : '');
              }),
          CustomButton(
            text: 'Send Message'.tr,
            onPressed: () {
              controller.sendMessage();
            },
          ),
          // Expanded(
          //     child: ListView.builder(
          //         itemCount: 5,
          //         itemBuilder: (context, index) {
          //           return const BubbleSpecialThree(
          //             text: 'Added iMassage shape bubbles',
          //             color: Color(0xFF1B97F3),
          //             tail: false,
          //             textStyle: TextStyle(
          //                 color: Colors.white,
          //                 fontSize: 16
          //             ),
          //           );
          //   })
          // )
        ],
      )
        )
    );
  }
}