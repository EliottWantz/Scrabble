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

  final GameService _gameService = Get.find();
  final WebsocketService _websocketService = Get.find();
  final SettingsService _settingsService = Get.find();

  @override
  Widget build(BuildContext context) {
    return Builder(
        builder: (BuildContext context) => Scaffold(
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
}
