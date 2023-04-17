import 'package:client_leger/controllers/chat_controller.dart';
import 'package:client_leger/controllers/game_controller.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:get/get_instance/src/bindings_interface.dart';

class GameBinding implements Bindings {
  @override
  void dependencies() {
    Get.lazyPut<GameController>(() => GameController());
    Get.lazyPut<ChatController>(() => ChatController());
  }
}