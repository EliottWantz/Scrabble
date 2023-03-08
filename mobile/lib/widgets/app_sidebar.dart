import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/auth_service.dart';
import 'package:client_leger/services/avatar_service.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:client_leger/utils/sidebar_theme.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:sidebarx/sidebarx.dart';

class AppSideBar extends StatelessWidget {
  AppSideBar({
    Key? key,
    required SidebarXController controller,
  })  : _controller = controller,
        super(key: key);

  final SidebarXController _controller;
  final SettingsService settingsService = Get.find();
  final AvatarService avatarService = Get.find();
  final AuthService authService = Get.find();
  final UserService userService = Get.find();

  @override
  Widget build(BuildContext context) {
    return SidebarX(
        collapseIcon: Icons.menu_open,
        extendIcon: Icons.menu,
        showToggleButton: false,
        controller: _controller,
        theme: sideBarUtils.sideBarTheme,
        extendedTheme: sideBarUtils.sideBarThemeExt,
        footerBuilder: (context, extended) {
          if (ModalRoute.of(context)!.settings.name == '/auth') {
            return _buildFooterAuth();
          } else if (ModalRoute.of(context)!.settings.name == '/auth/login' ||
              ModalRoute.of(context)!.settings.name == '/auth/register' ||
              ModalRoute.of(context)!.settings.name == '/home/game-start' ||
              ModalRoute.of(context)!.settings.name ==
                  '/auth/register/avatar-selection') {
            return _buildFooterLoginRegister();
          } else {
            return _buildFooterHome();
          }
        },
        headerDivider: const Divider(
          color: Colors.white,
        ),
        headerBuilder: (context, extended) {
          if (ModalRoute.of(context)!.settings.name == '/auth' ||
              ModalRoute.of(context)!.settings.name == '/auth/login' ||
              ModalRoute.of(context)!.settings.name == '/auth/register'||
              ModalRoute.of(context)!.settings.name == '/auth/register/avatar-selection') {
            return _buildHeaderAuth(extended);
          } else {
            return _buildHeaderHome(extended);
          }
        },
        items: _buildListItems(context));
  }

  Widget _buildFooterAuth() {
    return SizedBox(
      height: 150,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            children: [
              const Divider(color: Colors.white),
              const Gap(20),
              InkWell(
                  onTap: () {
                    settingsService.switchTheme();
                  },
                  child: Obx(
                    () => Icon(
                      settingsService.currentThemeIcon.value,
                      size: 20,
                      color: Colors.white,
                    ),
                  )),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFooterHome() {
    return SizedBox(
      height: 200,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            children: [
              const Divider(color: Colors.white),
              const Gap(20),
              InkWell(
                onTap: () {
                  showSettingsDialog();
                },
                child: const Icon(
                  Icons.settings,
                  color: Colors.white,
                ),
              ),
              const Gap(20),
              InkWell(
                  onTap: () {
                    settingsService.switchTheme();
                  },
                  child: Obx(
                    () => Icon(
                      settingsService.currentThemeIcon.value,
                      size: 20,
                      color: Colors.white,
                    ),
                  )),
              const Gap(40),
              InkWell(
                onTap: () async {
                  await DialogHelper.showLogoutDialog(authService.logout);
                },
                child: const Icon(
                  Icons.logout,
                  size: 20,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFooterLoginRegister() {
    return SizedBox(
      height: 150,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            children: [
              const Divider(color: Colors.white),
              const Gap(20),
              InkWell(
                  onTap: () {
                    settingsService.switchTheme();
                  },
                  child: Obx(
                    () => Icon(
                      settingsService.currentThemeIcon.value,
                      size: 20,
                      color: Colors.white,
                    ),
                  )),
              const Gap(40),
              InkWell(
                onTap: () {
                  Get.back();
                },
                child: const Icon(
                  Icons.arrow_back,
                  size: 20,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderAuth(bool extended) {
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
  }

  Widget _buildHeaderHome(bool extended) {
    return SizedBox(
      height: 120,
      child: Column(
        children: [
          Padding(
              padding: const EdgeInsets.all(16.0),
              child: Obx(
                () => CircleAvatar(
                  backgroundColor: Colors.transparent,
                  maxRadius: 40,
                  backgroundImage:
                      NetworkImage(userService.user.value!.avatar.url),
                ),
              )),
        ],
      ),
    );
  }

  List<SidebarXItem> _buildListItems(BuildContext context) {
    if (ModalRoute.of(context)!.settings.name == '/home') {
      return [
        SidebarXItem(
          icon: Icons.home,
          label: 'PolyScrabble',
          onTap: () {},
        ),
        const SidebarXItem(
          icon: Icons.person,
          label: 'Profile',
        ),
        const SidebarXItem(
          icon: Icons.people_alt,
          label: 'Social',
        ),
      ];
    } else if (ModalRoute.of(context)!.settings.name == '/auth/login') {
      return [
        const SidebarXItem(
          icon: Icons.home,
          label: 'Connexion',
        ),
      ];
    } else if (ModalRoute.of(context)!.settings.name == '/auth/register') {
      return [
        const SidebarXItem(
          icon: Icons.home,
          label: 'Inscription',
        ),
      ];
    } else if (ModalRoute.of(context)!.settings.name == '/home/game-start') {
      return [
        const SidebarXItem(
          icon: Icons.play_arrow,
          label: 'Options de Jeu',
        ),
      ];
    } else if (ModalRoute.of(context)!.settings.name ==
        'auth/register/avatar-selection') {
      return [
        const SidebarXItem(
          icon: Icons.home,
          label: 'Choix de l\'avatar',
        ),
      ];
    } else {
      return [
        const SidebarXItem(
          icon: Icons.home,
          label: 'PolyScrabble',
        ),
      ];
    }
  }

  void showSettingsDialog() {
    Get.dialog(
      Dialog(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Déconnexion',
                style: Get.textTheme.headline4,
              ),
              const Gap(20),
              Text(
                'Êtes-vous sûr de vouloir partir',
                style: Get.textTheme.headline6,
              ),
              const Gap(20),
            ],
          ),
        ),
      ),
      barrierDismissible: true,
    );
  }
}
