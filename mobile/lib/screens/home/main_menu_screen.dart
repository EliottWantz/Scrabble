import 'package:client_leger/controllers/chatbox_controller.dart';
import 'package:client_leger/controllers/home_controller.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/screens/floating_chat_screen.dart';
import 'package:client_leger/services/room_service.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/widgets/chatbox.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';

class MainMenuScreen extends GetView<HomeController> {
  MainMenuScreen({Key? key}) : super(key: key);

  final RoomService _roomService = Get.find();
  final SettingsService _settingsService = Get.find();

  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  RxBool selectedChatRoom = false.obs;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
      body: SafeArea(
        minimum: const EdgeInsets.symmetric(horizontal: 40.0),
        child: Center(
            child: SizedBox(
          height: 600,
          width: 600,
          child: Column(
            children: [
              Image(
                image: _settingsService.getLogo(),
              ),
              const Gap(20),
              Text('Choisissez votre mode de jeu',
                  style: Theme.of(context).textTheme.headline6),
              Gap(Get.height / 9),
              SizedBox(
                width: 210,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Get.toNamed(Routes.HOME + Routes.GAME_START,
                        arguments: 'classique');
                  },
                  icon: const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Icon(
                      Icons.videogame_asset_sharp,
                      size: 50,
                    ),
                  ),
                  label: const Text('Mode classique'), // <-- Text
                ),
              ),
              const Gap(40),
              SizedBox(
                width: 210,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Get.toNamed(Routes.HOME + Routes.GAME_START,
                        arguments: 'coop');
                  },
                  icon: const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Icon(
                      MdiIcons.crownCircleOutline,
                      size: 50,
                    ),
                  ),
                  label: const Text('Mode Coopératif'), // <-- Text
                ),
              ),
              const Gap(40),
              SizedBox(
                width: 210,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Get.toNamed(Routes.HOME + Routes.GAME_START,
                        arguments: 'tournoi');
                  },
                  icon: const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Icon(
                      MdiIcons.podium,
                      size: 50,
                    ),
                  ),
                  label: const Text('Mode Tournoi'), // <-- Text
                ),
              ),
            ],
          ),
        )),
      ),
    );
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
          title: Text(roomName.split('/').first),
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
