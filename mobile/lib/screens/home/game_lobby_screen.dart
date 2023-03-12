import 'package:client_leger/widgets/app_sidebar.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:sidebarx/sidebarx.dart';

class GameLobbyScreen extends StatelessWidget {
  GameLobbyScreen({Key? key}) : super(key: key);

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
                  Text('En attente d\'autre joueurs... Veuillez patientez',
                      style: Theme.of(context).textTheme.headline6),
                  Gap(Get.height / 5),
                  const CircularProgressIndicator(),
                  Gap(200),
                  Text('1/4 joueurs présents',
                      style: Theme.of(context).textTheme.headline6),
                ],
              ),
            )),
          );
        });
  }
}
