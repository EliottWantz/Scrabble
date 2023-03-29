import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/controllers/home_controller.dart';
import 'package:client_leger/models/game_room.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/game_service.dart';
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
  final UserService _userService = Get.find();

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
              height: 600,
              width: 600,
              child: Column(
                children: [
                  const Image(
                    image: AssetImage('assets/images/scrabble.png'),
                  ),
                  const Gap(20),
                  Text('Choisissez une option de jeu',
                      style: Theme.of(context).textTheme.headline6),
                  Gap(Get.height / 8),
                  SizedBox(
                    width: 230,
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: ElevatedButton.icon(
                        onPressed: () {
                          // _websocketService.createGameRoom();
                          // Get.toNamed(
                          //     Routes.HOME + Routes.GAME_START + Routes.LOBBY);
                        },
                        icon: const Icon(
                          // <-- Icon
                          Icons.create,
                          size: 50,
                        ),
                        label: const Text('Créer une partie'), // <-- Text
                      ),
                    ),
                  ),
                  const Gap(40),
                  SizedBox(
                    width: 230,
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: ElevatedButton.icon(
                        onPressed: () {
                          _showJoinableGamesDialog(context);
                        },
                        icon: const Icon(
                          // <-- Icon
                          Icons.format_list_numbered_sharp,
                          size: 50,
                        ),
                        label: const Text('Rejoindre une partie'), // <-- Text
                      ),
                    ),
                  ),
                  const Gap(40),
                  SizedBox(
                    width: 230,
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: ElevatedButton.icon(
                        onPressed: () {
                          // _websocketService.createGameRoom();
                          // Get.toNamed(
                          //     Routes.HOME + Routes.GAME_START + Routes.LOBBY);
                        },
                        icon: const Icon(
                          // <-- Icon
                          MdiIcons.eye,
                          size: 50,
                        ),
                        label: const Text('Observer une partie'), // <-- Text
                      ),
                    ),
                  ),
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
          child: Column(
            children: [
              const Gap(10),
              Text('Liste des parties',
                  style: Theme.of(context).textTheme.headline6),
              const Gap(10),
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
                    rows: _createJoinableGameRows(),
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
                      onPressed: () {},
                      child: const Text('Confirmer')),
                  const Gap(10),
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
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }

  List<DataRow> _createJoinableGameRows() {
    if (_gameService.joinableGames.value != null) {
      return _gameService.joinableGames.value!
          .map((game) => DataRow(cells: [
                DataCell(Text(game.id)),
                DataCell(
                  ElevatedButton.icon(
                    onPressed: () {
                      _websocketService.joinGame(game.id);
                    },
                    icon: const Icon(
                      // <-- Icon
                      Icons.play_arrow,
                      size: 20,
                    ),
                    label: const Text('Rejoindre'), // <-- Text
                  ),
                ),
              ]))
          .toList();
    }
    return [
      DataRow(cells: [DataCell(Text('')), DataCell(Text(''))])
    ];
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
}
