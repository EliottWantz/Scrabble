import 'package:client_leger/controllers/chatbox_controller.dart';
import 'package:client_leger/widgets/chatbox.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class MainMenuScreen extends GetView<ChatBoxController> {
  const MainMenuScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      minimum: EdgeInsets.symmetric(horizontal: 40.0),
      child: Align(
          alignment: Alignment.bottomCenter,
          child: SizedBox(
            width: 300,
              child: ChatBox()
          ),
      )
    );
  }
}
