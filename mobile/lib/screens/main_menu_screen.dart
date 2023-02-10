import 'package:client_leger/controllers/chatbox_controller.dart';
import 'package:client_leger/widgets/chatbox.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

class MainMenuScreen extends GetView<ChatBoxController> {
  const MainMenuScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      minimum: const EdgeInsets.symmetric(horizontal: 40.0),
      child: Center(
        child: SizedBox(
            height: 600,
            width: 600,
            child: Column(
              children: [
                ChatBox(),
                Gap(50),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: controller.messageTextEditingController,
                        decoration: const InputDecoration(
                            hintText: "entrez un message",
                            labelText: "entrez un message",
                            border: OutlineInputBorder(
                                borderRadius:
                                    BorderRadius.all(Radius.circular(8)))),
                      ),
                    ),
                    TextButton(
                        onPressed: () {
                          controller.sendMessage();
                        },
                        child: Text('TextButton')),
                  ],
                )
              ],
            )),
      ),
    );
  }
}
