import 'package:client_leger/services/room_service.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:client_leger/widgets/search_bar.dart';
import 'package:client_leger/widgets/user_list.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ExploreRoomsScreen extends StatelessWidget {
  ExploreRoomsScreen({Key? key}) : super(key: key);

  final RoomService _roomService = Get.find();
  final WebsocketService _websocketService = Get.find();

  RxString searchInput = ''.obs;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          children: [
            Align(
                alignment: Alignment.topLeft,
                child: Padding(
                  padding: EdgeInsets.all(8),
                  child: Text('create-room-screen.canal-join'.tr,
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 30)),
                )),
            SearchBar(searchInput, 'rooms'),
            Expanded(
                child: Obx(() => UserList(
                    mode: 'joinRoom',
                    inputSearch: searchInput,
                    items: _roomService.getListedChatRoomNames()))),
          ],
        ),
      ),
    );
  }
}
