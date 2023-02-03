import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:sidebarx/sidebarx.dart';

class appSideBar extends StatelessWidget {
  appSideBar({
    Key? key,
    required SidebarXController controller,
    required bool isAuthScreen,
  })  : _controller = controller,
        _isAuthScreen = isAuthScreen,
        super(key: key);

  final SidebarXController _controller;
  final bool _isAuthScreen;
  final SettingsService settingsService = Get.find();

  @override
  Widget build(BuildContext context) {
    return Obx(() => SidebarX(
        showToggleButton: _isAuthScreen == false,
        controller: _controller,
        theme: SidebarXTheme(
          margin: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: canvasColor,
            borderRadius: BorderRadius.circular(20),
          ),
          hoverColor: scaffoldBackgroundColor,
          textStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
          selectedTextStyle: const TextStyle(color: Colors.white),
          itemTextPadding: const EdgeInsets.only(left: 30),
          selectedItemTextPadding: const EdgeInsets.only(left: 30),
          itemDecoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: canvasColor),
          ),
          selectedItemDecoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: actionColor.withOpacity(0.37),
            ),
            gradient: const LinearGradient(
              colors: [accentCanvasColor, canvasColor],
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.28),
                blurRadius: 30,
              )
            ],
          ),
          iconTheme: IconThemeData(
            color: Colors.white.withOpacity(0.7),
            size: 20,
          ),
          selectedIconTheme: const IconThemeData(
            color: Colors.white,
            size: 20,
          ),
        ),
        extendedTheme: const SidebarXTheme(
          width: 200,
          decoration: BoxDecoration(
            color: canvasColor,
          ),
        ),
        footerBuilder: (context, extended) {
          return (ModalRoute.of(context)!.settings.name == '/auth/login' ||
                  ModalRoute.of(context)!.settings.name == '/auth/register')
              ? SizedBox(
                  height: 80,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Center(
                      child: Column(
                        children: [
                          InkWell(
                            onTap: () {
                              Get.back();
                            },
                            child: const Icon(
                              Icons.arrow_back,
                              size: 40,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              : const SizedBox();
        },
        // footerDivider: const Divider(color: Colors.white,),
        headerDivider: const Divider(
          color: Colors.white,
        ),
        headerBuilder: (context, extended) {
          return SizedBox(
            height: 80,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Center(
                child: Column(
                  children: const [
                    Icon(
                      Icons.account_circle,
                      size: 40,
                      color: Colors.white,
                    ),
                  ],
                ),
              ),
            ),
          );
        },
        items: _buildListItems()));
  }

  List<SidebarXItem> _buildListItems() {
    return _isAuthScreen
        ? [
            SidebarXItem(
              icon: settingsService.currentThemeIcon.value,
              label: 'Theme',
              onTap: () {
                settingsService.switchTheme();
              },
            ),
          ]
        : [
            SidebarXItem(
              icon: Icons.home,
              label: 'Home',
              onTap: () {
                debugPrint('Home');
              },
            ),
            const SidebarXItem(
              icon: Icons.person,
              label: 'Profile',
            ),
            const SidebarXItem(
              icon: Icons.settings,
              label: 'Settings',
            ),
            SidebarXItem(
              icon: settingsService.currentThemeIcon.value,
              label: 'Theme',
              onTap: () {
                settingsService.switchTheme();
              },
            ),
            SidebarXItem(icon: Icons.logout, label: 'Logout', onTap: () {

            }),
          ];
  }
}

const primaryColor = Color(0xFF685BFF);
const canvasColor = Color(0xFF2E2E48);
const scaffoldBackgroundColor = Color(0xFF464667);
const accentCanvasColor = Color(0xFF3E3E61);
const white = Colors.white;
final actionColor = const Color(0xFF5F5FA7).withOpacity(0.6);
final divider = Divider(color: white.withOpacity(0.3), height: 1);
