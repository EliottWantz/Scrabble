import 'package:client_leger/controllers/game_controller.dart';
import 'package:client_leger/models/tile.dart';
import 'package:client_leger/screens/chat_screen.dart';
import 'package:client_leger/screens/floating_chat_screen.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/widgets/board.dart';
import 'package:client_leger/widgets/board_tile.dart';
import 'package:client_leger/widgets/game_chat.dart';
import 'package:client_leger/widgets/timer.dart';
import 'package:flutter/material.dart';
import 'package:flutter_layout_grid/flutter_layout_grid.dart';
import 'package:flutter_speed_dial/flutter_speed_dial.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

import '../models/move_info.dart';
import '../models/move_types.dart';
import '../routes/app_routes.dart';
import '../services/room_service.dart';
import '../widgets/player_info.dart';

class GameScreen extends GetView<GameController> {
  GameScreen({Key? key}) : super(key: key);
  final GameService _gameService = Get.find();
  final RoomService _roomService = Get.find();

  final isDialOpen = ValueNotifier(false);
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  RxBool selectedChatRoom = false.obs;

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
        onWillPop: () async {
          if (isDialOpen.value) {
            isDialOpen.value = false;
            return false;
          } else {
            return true;
          }
        },
        child: Scaffold(
          resizeToAvoidBottomInset: true,
          drawerScrimColor: Colors.transparent,
          // floatingActionButton: SpeedDial(
          //   activeIcon: Icons.close,
          //   icon: Icons.question_answer_rounded,
          //   overlayOpacity: 0,
          //   openCloseDial: isDialOpen,
          //   children: [
          //     SpeedDialChild(
          //       child: Icon(Icons.mail),
          //       label: "Mail",
          //       onTap: () => const SizedBox(
          //               width: 200.0,
          //               height: 300.0,
          //               child: Card(child: Text('Hello World!')),
          //             ),
          //     ),
          //     SpeedDialChild(
          //         child: Icon(Icons.copy),
          //         label: "Copy"
          //     ),
          //   ],
          // ),
          floatingActionButton: FloatingActionButton(
            // IconButton(
            //     onPressed: () => _scaffoldKey.currentState?.openDrawer(),
            //     icon: const Icon(Icons.question_answer_rounded)
            // )
            onPressed: () {
              // Get.toNamed(Routes.AUTH + Routes.REGISTER + Routes.AVATAR_SELECTION,
              //     arguments: this);
              _scaffoldKey.currentState?.openEndDrawer();
            },
            autofocus: true,
            focusElevation: 5,
            child: const Icon(
              Icons.question_answer_rounded,
            ),
          ),
          key: _scaffoldKey,
          // appBar: AppBar(title: Text('app bar')),
          endDrawer: Drawer(

            child:
                Obx(() => Expanded(
                    child: _buildList()
                ))
          //   child: ListView(
          //     padding: EdgeInsets.zero,
          //     children: [
          //       const DrawerHeader(
          //           decoration: BoxDecoration(
          //             color: Colors.blue,
          //           ),
          //           child: Text('Drawer Header'),
          //       ),
          //       ListTile(
          //         title: const Text('Item 1'),
          //         onTap: () {
          //           // Get.toNamed(Routes.AUTH + Routes.REGISTER + Routes.AVATAR_SELECTION,
          //           //         arguments: this);
          //           Get.toNamed(Routes.CHAT);
          //         },
          //       ),
          //       Divider(),
          //       ListTile(
          //         title: const Text('Item 1'),
          //         onTap: () {
          //
          //         },
          //       ),
          //       Divider()
          //     ],
          //   )
          ),
          body: SingleChildScrollView(
            child: LayoutGrid(
              areas: '''
              leave  content  settings
              nav    content  aside
              nav    easel  aside
              nav    easel  chat
            ''',
              rowGap: 7,
              columnSizes: [1.fr, 2.fr, 1.fr],
              rowSizes: [
                40.px,
                auto,
                auto,
                50.px,
              ],
              children: [
                Center(
                  child: Padding(
                    padding: EdgeInsets.only(top: 5),
                    child: ElevatedButton.icon(
                      onPressed: () {},
                      icon: const Icon(
                        Icons.exit_to_app_rounded,
                        size: 20,
                      ),
                      label: const Text('Quitter la partie'), // <-- Text
                    ),
                  ),
                ).inGridArea('leave'),
                Align(
                  alignment: Alignment.topRight,
                  child: Padding(
                    padding: EdgeInsets.only(top: 5),
                    child: IconButton(
                      onPressed: () {},
                      icon: const Icon(
                        Icons.settings,
                        size: 30,
                      ), // <-- Text
                    ),
                  ).inGridArea('settings'),
                ),
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Timer(time: 600),
                      Gap(100),
                      Container(
                        padding: EdgeInsets.all(5),
                        decoration: BoxDecoration(
                            border: Border.all(width: 5),
                            borderRadius: BorderRadius.circular(12)),
                        child: Text(
                          'Lettres en réserve \n 80',
                          textAlign: TextAlign.center,
                          style: Get.context!.textTheme.headline6,
                        ),
                      ),
                      Gap(100),
                      ElevatedButton.icon(
                        onPressed: () {},
                        icon: const Icon(
                          Icons.lightbulb,
                          size: 30,
                        ),
                        label: const Text('Indices'),
                      )
                    ],
                  ),
                ).inGridArea('aside'),
                Obx(() => Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: _buildPlayersInfo(),
                      ),
                    )).inGridArea('nav'),
                ScrabbleBoard().inGridArea('content'),
                Obx(() => Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: _gameService
                                .getPlayer()!
                                .rack
                                .tiles
                                .map((e) => _buildEasel(e))
                                .toList()),
                        Gap(10),
                        !controller.isClientTurn()
                            ? Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  ElevatedButton.icon(
                                    onPressed: () {
                                      controller.placeLetters();
                                    },
                                    icon: const Icon(
                                      Icons.check,
                                      size: 20,
                                    ),
                                    label: const Text('Placer'),
                                  ),
                                  const Gap(20),
                                  ElevatedButton.icon(
                                    onPressed: () {
                                      controller.skipTurn();
                                    },
                                    icon: const Icon(
                                      Icons.double_arrow,
                                      size: 20,
                                    ),
                                    label: const Text('Passer'), // <-- Text
                                  ),
                                  const Gap(20),
                                  ElevatedButton.icon(
                                    onPressed: () {
                                      controller.exchangeLetters();
                                    },
                                    icon: const Icon(
                                      Icons.change_circle,
                                      size: 20,
                                    ),
                                    label: const Text('Échanger'), // <-- Text
                                  ),
                                ],
                              )
                            : const SizedBox(),
                      ],
                    )).inGridArea('easel'),
              ],
            ),
          ),
        )
    );
  }

  Widget _buildEasel(Tile tile) {
    return controller.getEaselChildToDisplay(tile);
  }

  List<Widget> _buildPlayersInfo() {
    List<Widget> playerInfoPanels = [];
    for (final player in _gameService.currentGame.value!.players) {
      playerInfoPanels.add(const Gap(20));
      playerInfoPanels.add(PlayerInfo(
          playerName: player.username,
          isPlayerTurn: _gameService.isCurrentPlayer(player.id),
          score: player.score,
          isBot: player.isBot));
      playerInfoPanels.add(const Gap(20));
    }
    playerInfoPanels.add(const Gap(20));
    return playerInfoPanels;
  }

  Widget _buildList() {
    if (!selectedChatRoom.value) {
      print("selectedchatroom value");
      print(selectedChatRoom);
      return Column(
        children: [
          Container(
            height: 100,
            width: double.infinity,
            child: const DrawerHeader(
              decoration: BoxDecoration(
                color: Colors.blue,
              ),
              child: Text('Drawer Header'),
            ),
          ),
          Expanded(
            child: ListView.builder(
                // padding: const EdgeInsets.all(16.0),
              padding: EdgeInsets.zero,
              itemCount: _roomService.getRooms().length,
              itemBuilder: (context, item) {
                final index = item;
                return _buildRow(
                    _roomService.getRooms()[index].roomName,
                    _roomService.getRooms()[index].roomId
                );
              },
            )
          )
        ],
      );
    } else {
      print("selectedchatroom value");
      print(selectedChatRoom);
      return FloatingChatScreen(
          selectedChatRoom,

      );
      //   Container(
      //   alignment: Alignment.center,
      //   child: Text('placeholder'),
      // );
    }

  }

  Widget _buildRow(String roomName, String roomId) {
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
