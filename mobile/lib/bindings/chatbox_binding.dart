import 'package:client_leger/controllers/chatbox_controller.dart';
import 'package:get/get.dart';

class ChatBoxBinding implements Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ChatBoxController>(
        () => ChatBoxController()
    );
  }
}