import 'package:client_leger/screens/floating_chat_screen.dart';
import 'package:client_leger/services/room_service.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:client_leger/widgets/app_sidebar.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:sidebarx/sidebarx.dart';

import '../../services/game_service.dart';

class GameLobbyScreen extends StatelessWidget {
  GameLobbyScreen({Key? key}) : super(key: key);

  final sideBarController =
      SidebarXController(selectedIndex: 0, extended: true);

  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  final GameService _gameService = Get.find();
  final WebsocketService _websocketService = Get.find();
  final RoomService _roomService = Get.find();

  RxBool selectedChatRoom = false.obs;
  final SettingsService _settingsService = Get.find();

  @override
  Widget build(BuildContext context) {
    return Builder(
        builder: (BuildContext context) => Scaffold(
          resizeToAvoidBottomInset: true,
          drawerScrimColor: Colors.transparent,
          floatingActionButton: FloatingActionButton(
            onPressed: () {
              _scaffoldKey.currentState?.openEndDrawer();
            },
            backgroundColor: Color.fromARGB(255,98,0,238),
            foregroundColor: Colors.white,
            autofocus: true,
            focusElevation: 5,
            child: const Icon(
              Icons.question_answer_rounded,
            ),
          ),
          key: _scaffoldKey,
          endDrawer: Drawer(child: Obx(() => _buildChatRoomsList())),
              body: Row(
                children: [
                  AppSideBar(controller: sideBarController),
                  Expanded(
                    child: _buildItems(
                      context,
                    ),
                  ),
                ],
              ),
            ));
  }

  Widget _buildItems(BuildContext context) {
    return AnimatedBuilder(
        animation: sideBarController,
        builder: (context, child) {
          return SingleChildScrollView(
            child: Center(
                child: SizedBox(
              height: 610,
              width: 600,
              child: Column(
                children: [
                  Image(
                    image: _settingsService.getLogo(),
                  ),
                  const Gap(20),
                  Obx(() => _buildStartButton(context)),
                  Gap(Get.height / 5),
                  const CircularProgressIndicator(),
                  Gap(200),
                  Obx(() => Text('${_gameService.currentGameRoomUserIds.value!.length}/4 joueurs présents',
                      style: Theme.of(context).textTheme.headline6)),
                ],
              )),
            ),
          );
        });
  }

  Widget _buildStartButton(BuildContext context) {
    if (_gameService.currentGameRoomUserIds.value!.length < 2) {
      return Text('En attente d\'autre joueurs... Veuillez patientez',
          style: Theme.of(context).textTheme.headline6);
    } else {
      return ElevatedButton.icon(
        onPressed: () {
          _websocketService.startGame(_gameService.currentGameId);
        },
        icon: const Icon(
          // <-- Icon
          Icons.play_arrow,
          size: 20,
        ),
        label: const Text('Démarrer la partie'), // <-- Text
      );
    }
  }

  Widget _buildChatRoomsList() {
    if (!selectedChatRoom.value) {
      print("selectedchatroom value");
      print(selectedChatRoom);
      return Column(
        children: [
          Container(
            color: Color.fromARGB(255,98,0,238),
            height: 60,
            width: double.infinity,
            child: const DrawerHeader(
              child: Text(
                'Chats',
                style: TextStyle(
                    fontSize: 20,
                    color: Colors.white
                ),
              ),
            ),
          ),
          Expanded(
              child: ListView.builder(
                // padding: const EdgeInsets.all(16.0),
                padding: EdgeInsets.zero,
                itemCount: _roomService.getRooms().length,
                itemBuilder: (context, item) {
                  final index = item;
                  return _buildChatRoomRow(_roomService.getRooms()[index].roomName,
                      _roomService.getRooms()[index].roomId);
                },
              ))
        ],
      );
    } else {
      print("selectedchatroom value");
      print(selectedChatRoom);
      return FloatingChatScreen(selectedChatRoom);
    }
  }

  Widget _buildChatRoomRow(String roomName, String roomId) {
    return Column(
      children: [
        ListTile(
          title: Text(roomName),
          // onTap: () => Get.toNamed(Routes.CHAT, arguments: {'text': 'roomName'}),
          onTap: () {
            selectedChatRoom.value = !selectedChatRoom.value;
            _roomService.currentFloatingChatRoomId.value = roomId;
            _roomService.updateCurrentFloatingRoomMessages();
          },
        ),
        const Divider(),
      ],
    );
  }
}
