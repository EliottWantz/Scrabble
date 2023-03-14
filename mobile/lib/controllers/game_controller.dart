import 'package:client_leger/services/websocket_service.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:get/get_state_manager/src/simple/get_controllers.dart';

class GameController extends GetxController {
  GameController();

  final WebsocketService websocketService = Get.find();

  List<String> letters = [];
  Map<String, String> covers = {};
}