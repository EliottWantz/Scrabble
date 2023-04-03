import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/controllers/home_controller.dart';
import 'package:client_leger/models/game_room.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/screens/floating_chat_screen.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/services/room_service.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:client_leger/utils/constants/game.dart';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:client_leger/widgets/custom_button.dart';
import 'package:client_leger/widgets/app_sidebar.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
import 'package:sidebarx/sidebarx.dart';

class GameStartScreen extends StatelessWidget {
  GameStartScreen({super.key});

  final sideBarController =
      SidebarXController(selectedIndex: 0, extended: true);
  final String gameMode = Get.arguments;
  final WebsocketService _websocketService = Get.find();
  final GameService _gameService = Get.find();
  final RoomService _roomService = Get.find();
  final SettingsService _settingsService = Get.find();

  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  RxBool selectedChatRoom = false.obs;

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
                backgroundColor: Color.fromARGB(255, 98, 0, 238),
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
              height: 600,
              width: 600,
              child: Column(
                children: [
                  Image(
                    image: _settingsService.getLogo(),
                  ),
                  const Gap(20),
                  Text('Choisissez une option de jeu',
                      style: Theme.of(context).textTheme.headline6),
                  Gap(Get.height / 8),
                  SizedBox(
                    width: 230,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        _websocketService.createGameRoom();
                        Get.toNamed(
                            Routes.HOME + Routes.GAME_START + Routes.LOBBY);
                      },
                      icon: const Padding(
                        padding: EdgeInsets.all(8.0),
                        child: Icon(
                          Icons.create,
                          size: 50,
                        ),
                      ),
                      label: Text(
                          '${gameMode == 'tournoi' ? 'Créer un tournoi' : 'Créer une partie'}'), // <-- Text
                    ),
                  ),
                  const Gap(40),
                  SizedBox(
                    width: 230,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        if (gameMode == 'tournoi') {
                          _showPainter();
                        } else {
                          _showJoinableGamesDialog(context);
                        }
                      },
                      icon: const Padding(
                        padding: EdgeInsets.all(8.0),
                        child: Icon(
                          // <-- Icon
                          Icons.format_list_numbered_sharp,
                          size: 50,
                        ),
                      ),
                      label: Text(
                          '${gameMode == 'tournoi' ? 'Rejoindre un tournoi' : 'Rejoindre une partie'}'), // <-- Text
                    ),
                  ),
                  const Gap(40),
                  gameMode != 'tournoi'
                      ? SizedBox(
                          width: 230,
                          child: ElevatedButton.icon(
                            onPressed: () {},
                            icon: const Padding(
                              padding: EdgeInsets.all(8.0),
                              child: Icon(
                                // <-- Icon
                                MdiIcons.eye,
                                size: 50,
                              ),
                            ),
                            label:
                                const Text('Observer une partie'), // <-- Text
                          ),
                        )
                      : const SizedBox(),
                ],
              ),
            )),
          );
        });
  }

  void _showJoinableGamesDialog(BuildContext context) {
    Get.dialog(
      Dialog(
        child: SizedBox(
          height: 500,
          width: 600,
          child:
              // child: Column(
              //   children: [
              // const Gap(10),
              // Text('Liste des parties',
              //     style: Theme.of(context).textTheme.headline6),
              DefaultTabController(
            length: 2,
            child: Scaffold(
              appBar: AppBar(
                elevation: 0,
                toolbarHeight: 0,
                bottom: const TabBar(
                  tabs: [
                    Tab(text: 'Parties privées'),
                    Tab(text: 'Parties publiques'),
                  ],
                ),
              ),
              body: TabBarView(
                children: [_buildPublicGamesTab(), _buildPrivateGamesTab()],
              ),
            ),
          ),
          // const Gap(10),
          // Obx(
          //   () => Expanded(
          //       child: SingleChildScrollView(
          //     child: DataTable(
          //       columns: const <DataColumn>[
          //         DataColumn(
          //           label: Expanded(
          //             child: Text(
          //               'Room Name',
          //             ),
          //           ),
          //         ),
          //         DataColumn(
          //           label: Expanded(
          //             child: Text(
          //               'Users',
          //             ),
          //           ),
          //         ),
          //       ],
          //       rows: _createJoinableGameRows(),
          //     ),
          //   )),
          // ),
          // const Gap(10),
          // Row(
          //   mainAxisAlignment: MainAxisAlignment.center,
          //   children: [
          //     TextButton(
          //         style: TextButton.styleFrom(
          //             shape: RoundedRectangleBorder(
          //                 borderRadius: BorderRadius.circular(12),
          //                 side: const BorderSide(color: Colors.black))),
          //         onPressed: () {
          //           DialogHelper.hideLoading();
          //         },
          //         child: const Text('Annuler')),
          //   ],
          // ),
          // const Gap(10),
          // ],
        ),
      ),
      // ),
      // barrierDismissible: false,
    );
  }

  Widget _buildPublicGamesTab() {
    return Column(
      children: [
        Obx(
          () => Expanded(
              child: SingleChildScrollView(
            child: DataTable(
              columns: const <DataColumn>[
                DataColumn(
                  label: Expanded(
                    child: Text(
                      'Room Name',
                    ),
                  ),
                ),
                DataColumn(
                  label: Expanded(
                    child: Text(
                      'Users',
                    ),
                  ),
                ),
              ],
              rows: _createJoinableGameRows(false),
            ),
          )),
        ),
        const Gap(10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextButton(
                style: TextButton.styleFrom(
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: Colors.black))),
                onPressed: () {
                  DialogHelper.hideLoading();
                },
                child: const Text('Annuler')),
          ],
        ),
        const Gap(10),
      ],
    );
  }

  Widget _buildPrivateGamesTab() {
    return Column(
      children: [
        Obx(
          () => Expanded(
              child: SingleChildScrollView(
            child: DataTable(
              columns: const <DataColumn>[
                DataColumn(
                  label: Expanded(
                    child: Text(
                      'Room Name',
                    ),
                  ),
                ),
                DataColumn(
                  label: Expanded(
                    child: Text(
                      'Users',
                    ),
                  ),
                ),
              ],
              rows: _createJoinableGameRows(true),
            ),
          )),
        ),
        const Gap(10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextButton(
                style: TextButton.styleFrom(
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: Colors.black))),
                onPressed: () {
                  DialogHelper.hideLoading();
                },
                child: const Text('Annuler')),
          ],
        ),
        const Gap(10),
      ],
    );
  }

  List<DataRow> _createJoinableGameRows(bool privateGames) {
    if (_gameService.joinableGames.value != null) {
      return _gameService.joinableGames.value!
          .expand((game) => [
                if (game.isPrivateGame == privateGames)
                  DataRow(cells: [
                    DataCell(Text(game.id)),
                    DataCell(
                      ElevatedButton.icon(
                        onPressed: () {
                          _websocketService.joinGame(game.id);
                          Get.toNamed(
                              Routes.HOME + Routes.GAME_START + Routes.LOBBY);
                        },
                        icon: const Icon(
                          // <-- Icon
                          Icons.play_arrow,
                          size: 20,
                        ),
                        label: const Text('Rejoindre'), // <-- Text
                      ),
                    ),
                  ])
              ])
          .toList();
    }
    return [
      const DataRow(cells: [DataCell(Text('')), DataCell(Text(''))])
    ];
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

// void _showCreateGameDialog(BuildContext context) {
//   Get.dialog(
//     Dialog(
//       child: SizedBox(
//         height: 500,
//         width: 600,
//         child: Column(
//           children: [
//             const Gap(10),
//             Text('Configuration d\'une partie',
//                 style: Theme.of(context).textTheme.headline6),
//             const Gap(10),
//             Expanded(
//                 child: Stepper(
//               type: StepperType.vertical,
//               physics: const ScrollPhysics(),
//               steps: [
//                 Step(
//                   title: const Text('Minuterie'),
//                   content: DropdownButton(
//                     menuMaxHeight: 200,
//                     items: GameConstants.timerOptions
//                         .map<DropdownMenuItem>((Map<String, Object> option) {
//                       return DropdownMenuItem(
//                         value: option['value'],
//                         child: Text(option['name'] as String),
//                       );
//                     }).toList(),
//                     onChanged: (value) {},
//                   ),
//                 ),
//                 Step(
//                   title: const Text('Visibilité'),
//                   content: Column(
//                     children: [],
//                   ),
//                 ),
//                 Step(
//                   title: const Text('Dictionnaire'),
//                   content: Column(
//                     children: [],
//                   ),
//                 ),
//               ],
//             )),
//             const Gap(10),
//             Row(
//               mainAxisAlignment: MainAxisAlignment.center,
//               children: [
//                 TextButton(
//                     style: TextButton.styleFrom(
//                         shape: RoundedRectangleBorder(
//                             borderRadius: BorderRadius.circular(12),
//                             side: const BorderSide(color: Colors.black))),
//                     onPressed: () {},
//                     child: const Text('Confirmer')),
//                 const Gap(10),
//                 TextButton(
//                     style: TextButton.styleFrom(
//                         shape: RoundedRectangleBorder(
//                             borderRadius: BorderRadius.circular(12),
//                             side: const BorderSide(color: Colors.black))),
//                     onPressed: () {
//                       DialogHelper.hideLoading();
//                     },
//                     child: const Text('Annuler')),
//               ],
//             ),
//             const Gap(10),
//           ],
//         ),
//       ),
//     ),
//     barrierDismissible: false,
//   );
// }
  void _showPainter() {
    Get.dialog(
        Dialog(
          child: SizedBox(
            height: 800,
            width: 850,
            child: CustomPaint(
              painter: TournamentPainter(),
              child: Align(
                  alignment: Alignment.topRight,
                  child: IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () {
                      DialogHelper.hideLoading();
                    },
                  )),
            ),
          ),
        ),
        barrierDismissible: false);
  }
}

class TournamentPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    var padding = 100.0;
    var width = 150.0;
    var height = 100.0;
    var offset = width - height;

    var paint = Paint()
      ..color = Get.isDarkMode ? Colors.white : Colors.black
      ..strokeWidth = 5.0
      ..style = PaintingStyle.stroke;

    final textSpan = TextSpan(
        text: 'Progression du tournoi en cours',
        style: Get.textTheme.headline6);
    final TilePainter = TextPainter(
      text: textSpan,
      textDirection: TextDirection.ltr,
    );
    TilePainter.layout(
      minWidth: 0,
      maxWidth: size.width,
    );
    final xCenter = (size.width - TilePainter.width) / 2;
    final yTop = 20.0;
    final titlePos = Offset(xCenter, yTop);
    TilePainter.paint(canvas, titlePos);

    for (int i = 0; i < 4; i++) {
      var rightSideY = padding * (i + 1) + offset * i;
      canvas.drawRect(Rect.fromLTWH(padding, rightSideY, width, height), paint);
      canvas.drawLine(Offset(padding + width, rightSideY + height / 2),
          Offset(padding + width + offset * 2, rightSideY + height / 2), paint);
      if (i.isEven) {
        canvas.drawLine(
            Offset(padding + width + offset * 2, rightSideY + height / 2 - 2.5),
            Offset(padding + width + offset * 2,
                rightSideY + height / 2 + height + offset + 2.5),
            paint);
        canvas.drawLine(
            Offset(
                padding + width + offset * 2, rightSideY + height + offset / 2),
            Offset(
                padding + width + offset * 3, rightSideY + height + offset / 2),
            paint);
      }
    }
    for (int i = 0; i < 2; i++) {
      var rightSideY =
          padding * (i + 1) + offset * i * 4 + height / 2 + offset / 2;
      canvas.drawRect(
          Rect.fromLTWH(
              padding + width + offset * 3, rightSideY, width, height),
          paint);
      canvas.drawLine(
          Offset(padding + width + offset * 3 + width, rightSideY + height / 2),
          Offset(padding + width + offset * 3 + width + offset,
              rightSideY + height / 2),
          paint);
      if (i.isEven) {
        canvas.drawLine(
            Offset(padding + width + offset * 3 + width + offset - 2.5,
                rightSideY + height / 2),
            Offset(padding + width + offset * 3 + width + offset,
                rightSideY + height / 2 + height + offset * 4 + 2.5),
            paint);
        canvas.drawLine(
            Offset(padding + width + offset * 3 + width + offset,
                rightSideY + height + offset * 2),
            Offset(padding + width + offset * 3 + width + offset * 2,
                rightSideY + height + offset * 2),
            paint);
      }
    }

    for (int i = 0; i < 1; i++) {
      var rightSideY = height * 2 + offset * 2 + offset / 2;
      canvas.drawRect(
          Rect.fromLTWH(padding + width + offset * 3 + width + offset * 2,
              rightSideY, width, height),
          paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}
