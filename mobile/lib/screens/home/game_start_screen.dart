import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/controllers/home_controller.dart';
import 'package:client_leger/routes/app_routes.dart';
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
                    onPressed: () {
                    },
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
}
