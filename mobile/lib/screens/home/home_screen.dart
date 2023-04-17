import 'package:client_leger/controllers/home_controller.dart';
import 'package:client_leger/screens/home/main_menu_screen.dart';
import 'package:client_leger/screens/home/profile_screen.dart';
import 'package:client_leger/screens/home/social_screen.dart';
import 'package:client_leger/screens/rules_screen.dart';
import 'package:client_leger/widgets/app_sidebar.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:sidebarx/sidebarx.dart';

class HomeScreen extends GetView<HomeController> {
  HomeScreen({Key? key}) : super(key: key);

  final sidebarController =
      SidebarXController(selectedIndex: 0, extended: true);
  final _key = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return Builder(
        builder: (BuildContext context) => Scaffold(
              key: _key,
              body: Row(
                children: [
                  AppSideBar(controller: sidebarController),
                  Expanded(
                    child: Center(
                      child: _buildItems(
                        context,
                      ),
                    ),
                  ),
                ],
              ),
            ));
  }

  Widget _buildItems(BuildContext context) {
    final theme = Theme.of(context);
    return AnimatedBuilder(
        animation: sidebarController,
        builder: (context, child) {
          final pageTitle = _getTitleByIndex(sidebarController.selectedIndex);
          switch (sidebarController.selectedIndex) {
            case 0:
              return MainMenuScreen();
            case 1:
              return ProfileScreen();
            case 2:
              return SocialScreen();
            case 3:
              return RulesScreen();
            default:
              return Text(
                pageTitle,
                style: theme.textTheme.headlineSmall,
              );
          }
        });
  }
}

String _getTitleByIndex(int index) {
  switch (index) {
    case 0:
      return 'Home';
    case 1:
      return 'Profile';
    case 2:
      return 'Settings';
    case 3:
      return 'Home';
    default:
      return 'Not found page';
  }
}
