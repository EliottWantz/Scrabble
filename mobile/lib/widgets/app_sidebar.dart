import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/auth_service.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:client_leger/utils/sidebar_theme.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:sidebarx/sidebarx.dart';

class AppSideBar extends StatelessWidget {
  AppSideBar({
    Key? key,
    required SidebarXController controller,
  })  : _controller = controller,
        super(key: key);

  final SidebarXController _controller;
  final SettingsService settingsService = Get.find();
  final AuthService authService = Get.find();

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
              ModalRoute.of(context)!.settings.name == '/auth/register') {
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
              ModalRoute.of(context)!.settings.name == '/auth/register') {
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
            child: CircleAvatar(
              radius: 40,
              child: Image.asset('assets/images/avatar(7).png'),
            ),
          ),
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
    } else if (ModalRoute.of(context)!.settings.name == '/avatar-selection') {
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
