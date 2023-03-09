import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/controllers/home_controller.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:client_leger/utils/constants/game.dart';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:client_leger/widgets/custom_button.dart';
import 'package:client_leger/widgets/app_sidebar.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:sidebarx/sidebarx.dart';

class GameStartScreen extends StatelessWidget {
  GameStartScreen({super.key});

  final sideBarController =
      SidebarXController(selectedIndex: 0, extended: true);
  final WebsocketService _websocketService = Get.find();
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
                  Gap(Get.height / 6),
                  ElevatedButton.icon(
                    onPressed: () {
                      // _websocketService.createRoom('test',
                      //     userIds: [_userService.user.value!.id]);
                      Get.toNamed(Routes.HOME+Routes.GAME_START+Routes.LOBBY);
                    },
                    icon: const Icon(
                      // <-- Icon
                      Icons.videogame_asset_sharp,
                      size: 60,
                    ),
                    label: const Text('Créer une partie'), // <-- Text
                  ),
                  const Gap(60),
                  ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(
                      // <-- Icon
                      Icons.videogame_asset_sharp,
                      size: 60,
                    ),
                    label: const Text('Rejoindre une partie'), // <-- Text
                  ),
                ],
              ),
            )),
          );
        });
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
