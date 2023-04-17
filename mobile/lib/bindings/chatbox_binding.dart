import 'package:client_leger/controllers/chatbox_controller.dart';
import 'package:client_leger/controllers/friends_controller.dart';
import 'package:client_leger/controllers/friends_sidebar_controller.dart';
import 'package:get/get.dart';

import '../controllers/chat_controller.dart';

class ChatBoxBinding implements Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ChatBoxController>(
        () => ChatBoxController()
    );
    Get.lazyPut<FriendsController>(() => FriendsController());
    Get.lazyPut<FriendsSideBarController>(() => FriendsSideBarController());
    Get.lazyPut<ChatController>(() => ChatController());
  }
}