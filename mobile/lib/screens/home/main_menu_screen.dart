import 'package:client_leger/controllers/chatbox_controller.dart';
import 'package:client_leger/controllers/home_controller.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/widgets/chatbox.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

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
            Gap(Get.height / 6),
            ElevatedButton.icon(
              onPressed: () {
                Get.toNamed(Routes.HOME + Routes.GAME_START);
              },
              icon: const Icon(
                // <-- Icon
                Icons.videogame_asset_sharp,
                size: 60,
              ),
              label: const Text('Mode classique'), // <-- Text
            ),
          ],
        ),
      )),
    );
  }
}
