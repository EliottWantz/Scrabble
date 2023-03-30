import 'package:client_leger/controllers/chatbox_controller.dart';
import 'package:client_leger/controllers/home_controller.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/widgets/chatbox.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';

class MainMenuScreen extends GetView<HomeController> {
  MainMenuScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      minimum: const EdgeInsets.symmetric(horizontal: 40.0),
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
    );
  }
}