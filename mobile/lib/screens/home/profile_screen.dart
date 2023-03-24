import 'package:client_leger/models/avatar.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/widgets/profile_avatar.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';

class ProfileScreen extends StatelessWidget {
  ProfileScreen({Key? key}) : super(key: key);

  final UserService userService = Get.find();

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          elevation: 0,
          toolbarHeight: 0,
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Profil utilisateur', icon: Icon(Icons.person)),
              Tab(
                  text: 'Activité de l\'utilisateur',
                  icon: Icon(Icons.access_time))
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildUserProfileTab(),
            _buildUserActivityTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildUserProfileTab() {
    return Column(
      children: [
        const Gap(20),
        Obx(() => ProfileWidget(
            imagePath: userService.user.value!.avatar.url, onClicked: () {
              Get.toNamed(Routes.HOME + Routes.PROFILE_EDIT);
        })),
        const Gap(20),
        Center(
          child: Text(
            userService.user.value!.username,
            style: Get.context!.textTheme.headline6,
          ),
        ),
        const SizedBox(height: 4),
        Center(
          child: Text(
            userService.user.value!.email,
            style: Get.context!.textTheme.headline5,
          ),
        ),
        Gap(50),
        Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.format_list_numbered),
                Gap(5),
                Text(
                  'Nombre de parties jouées : 20',
                  style: Get.context!.textTheme.button,
                )
              ],
            ),
            Gap(20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.check_circle_sharp),
                Gap(5),
                Text('Nombre de parties gagnées : 5',
                    style: Get.context!.textTheme.button)
              ],
            ),
            Gap(20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.scoreboard_sharp),
                Gap(5),
                Text('Moyenne de points par partie : 350',
                    style: Get.context!.textTheme.button)
              ],
            ),
            Gap(20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.timelapse),
                Gap(5),
                Text('Moyenne de temps de jeu : 15 min',
                    style: Get.context!.textTheme.button)
              ],
            )
          ],
        )
      ],
    );
  }

  Widget _buildUserActivityTab() {
    return Center(child: Text('User Activity'));
  }
}
