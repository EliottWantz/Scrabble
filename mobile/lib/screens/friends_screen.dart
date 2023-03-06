import 'package:client_leger/controllers/chatbox_controller.dart';
import 'package:client_leger/widgets/chatbox.dart';
import 'package:client_leger/widgets/friends_sidebar.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

class FriendsScreen extends GetView<ChatBoxController> {
  FriendsScreen({Key? key}) : super(key: key);

  final _key = GlobalKey<ScaffoldState>();
  final FocusNode messageInputFocusNode = FocusNode();

  @override
  Widget build(BuildContext context) {
    return Builder(
        builder: (BuildContext context) => Scaffold(
          key: _key,
          body: Row(
            children: [
              FriendsSideBar(),
              Expanded(child: Center(
                  child: _buildItems(
                  context,
                ),
              ))
            ],
          ),
        )
    );
  }

  Widget _buildItems(BuildContext context) {
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
                        focusNode: messageInputFocusNode,
                        onSubmitted: (_) {
                          controller.sendMessage();
                          messageInputFocusNode.requestFocus();
                        },
                        controller: controller.messageTextEditingController,
                        decoration: const InputDecoration(
                            hintText: "entrez un message",
                            labelText: "entrez un message",
                            border: OutlineInputBorder(
                                borderRadius:
                                BorderRadius.all(Radius.circular(8)))),
                      ),
                    ),
                    Gap(10),
                    TextButton(
                        onPressed: () {
                          controller.sendMessage();
                        },
                        child: Text('Envoyer')),
                  ],
                )
              ],
            )),
      ),
    );

    // return SafeArea(
    //     minimum: const EdgeInsets.symmetric(horizontal: 40.0),
    //     child: Center(
    //       child: SizedBox(
    //         width: 300,
    //         child: Column(
    //           mainAxisAlignment: MainAxisAlignment.center,
    //           children: const [
    //             Text('Friends List', style: TextStyle(fontSize: 30),)
    //           ],
    //         ),
    //       )
    //     )
    // );
  }
}
