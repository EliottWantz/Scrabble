import 'package:client_leger/controllers/chatbox_controller.dart';
import 'package:client_leger/widgets/chatbox.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class MainMenuScreen extends GetView<ChatBoxController> {
  const MainMenuScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      minimum: const EdgeInsets.symmetric(horizontal: 40.0),
      child: Center(
        child: SizedBox(
          width: 300,
          child: Container (
            child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Text('Main',style: TextStyle(fontSize: 30),),
              TextButton(onPressed: (){
                controller.sendMessage();
              }, child: Text('TextButton')),
              // Obx(() => Text(controller.websocketService.messages[0].payload!.message)),
              // Obx(() => Text(controller.websocketService.timestamp.value))
              ChatBox()
            ],
          ),
        ),
      ),
    ),);
  }
}
