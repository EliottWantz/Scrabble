import 'package:get/get.dart';

import '../models/chat_message_payload.dart';
import '../services/room_service.dart';

class ChatController extends GetxController {
  final RoomService roomService = Get.find();

  late RxList<ChatMessagePayload> messages = <ChatMessagePayload>[].obs;
  // List<ChatMessagePayload> get messages =>  roomService.getCurrentRoomChatMessagePayloads();

  // updateMessages() {
  //   messages.value = roomService.getCurrentRoomChatMessagePayloads();
  // }

  ChatController() {
    messages.listen((p0) {print('message from constructor');});
  }

  @override
  void onInit() {
    // TODO: implement onInit
    messages.listen((p0) {print('messages have changed');});
    super.onInit();
  }
}