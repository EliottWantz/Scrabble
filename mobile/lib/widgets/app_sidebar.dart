import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/services/auth_service.dart';
import 'package:client_leger/services/avatar_service.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/services/user_service.dart';
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
  final AvatarService avatarService = Get.find();
  final AuthService authService = Get.find();
  final UserService userService = Get.find();
  final ApiRepository apiRepository = Get.find();
  final GameService gameService = Get.find();

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
              ModalRoute.of(context)!.settings.name ==
                  '/auth/register/avatar-selection') {
            return _buildFooterLoginRegister();
          } else if (ModalRoute.of(context)!.settings.name ==
              '/home/game-start/lobby') {
            return _buildFooterLobby();
          } else if (ModalRoute.of(context)!.settings.name ==
                  '/home/game-start' ||
              ModalRoute.of(context)!.settings.name == '/home/profile-edit') {
            return _buildFooterApp();
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
              ModalRoute.of(context)!.settings.name == '/auth/register' ||
              ModalRoute.of(context)!.settings.name ==
                  '/auth/register/avatar-selection') {
            return _buildHeaderAuth(extended);
          } else {
            return _buildHeaderHome(extended);
          }
        },
        items: _buildListItems(context));
  }

  Widget _buildFooterApp() {
    return SizedBox(
      height: 220,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            children: [
              const Divider(color: Colors.white),
              const Gap(20),
              Obx(() => DropdownButton<String>(
                    underline: SizedBox(),
                    value: settingsService.currentLangValue.value,
                    style: TextStyle(color: Colors.white),
                    dropdownColor: Color(0xFF2E2E48),
                    items: [
                      DropdownMenuItem(
                        child: Center(child: Text('language-french'.tr)),
                        value: 'fr',
                      ),
                      DropdownMenuItem(
                          child: Center(child: Text('language-english'.tr)),
                          value: 'en')
                    ],
                    onChanged: (String? value) async {
                      await settingsService.switchLang(value!);
                    },
                    icon: const Icon(
                      Icons.language,
                      color: Colors.white,
                    ),
                  )),
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

  Widget _buildFooterAuth() {
    return SizedBox(
      height: 160,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            children: [
              const Divider(color: Colors.white),
              const Gap(20),
              Obx(() => DropdownButton<String>(
                    underline: SizedBox(),
                    value: settingsService.currentLangValue.value,
                    style: TextStyle(color: Colors.white),
                    dropdownColor: Color(0xFF2E2E48),
                    items: [
                      DropdownMenuItem(
                        child: Center(child: Text('language-french'.tr)),
                        value: 'fr',
                      ),
                      DropdownMenuItem(
                          child: Center(child: Text('language-english'.tr)),
                          value: 'en')
                    ],
                    onChanged: (String? value) async {
                      await settingsService.switchLang(value!);
                    },
                    icon: const Icon(
                      Icons.language,
                      color: Colors.white,
                    ),
                  )),
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

  Widget _buildFooterLobby() {
    return SizedBox(
      height: 220,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            children: [
              const Divider(color: Colors.white),
              const Gap(20),
              Obx(() => DropdownButton<String>(
                    underline: SizedBox(),
                    value: settingsService.currentLangValue.value,
                    style: TextStyle(color: Colors.white),
                    dropdownColor: Color(0xFF2E2E48),
                    items: [
                      DropdownMenuItem(
                        child: Center(child: Text('language-french'.tr)),
                        value: 'fr',
                      ),
                      DropdownMenuItem(
                          child: Center(child: Text('language-english'.tr)),
                          value: 'en')
                    ],
                    onChanged: (String? value) async {
                      await settingsService.switchLang(value!);
                    },
                    icon: const Icon(
                      Icons.language,
                      color: Colors.white,
                    ),
                  )),
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
                  if (gameService.isGameCreator() || gameService.isTournamentCreator()) {
                    bool isTournament = false;
                    if (gameService.currentTournament.value != null) {
                      isTournament = true;
                    }
                    await DialogHelper.showLobbyCreatorQuitDialog(isTournament);
                  } else {
                    await DialogHelper.showLobbyQuitDialog();
                  }
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

  Widget _buildFooterHome() {
    return SizedBox(
      height: 220,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            children: [
              const Divider(color: Colors.white),
              const Gap(20),
              Obx(() => DropdownButton<String>(
                    underline: SizedBox(),
                    value: settingsService.currentLangValue.value,
                    style: TextStyle(color: Colors.white),
                    dropdownColor: Color(0xFF2E2E48),
                    items: [
                      DropdownMenuItem(
                        child: Center(child: Text('language-french'.tr)),
                        value: 'fr',
                      ),
                      DropdownMenuItem(
                          child: Center(child: Text('language-english'.tr)),
                          value: 'en')
                    ],
                    onChanged: (String? value) async {
                      await settingsService.switchLang(value!);
                    },
                    icon: const Icon(
                      Icons.language,
                      color: Colors.white,
                    ),
                  )),
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
      height: 220,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            children: [
              const Divider(color: Colors.white),
              const Gap(20),
              Obx(() => DropdownButton<String>(
                    underline: SizedBox(),
                    value: settingsService.currentLangValue.value,
                    style: TextStyle(color: Colors.white),
                    dropdownColor: Color(0xFF2E2E48),
                    items: [
                      DropdownMenuItem(
                        child: Center(child: Text('language-french'.tr)),
                        value: 'fr',
                      ),
                      DropdownMenuItem(
                          child: Center(child: Text('language-english'.tr)),
                          value: 'en')
                    ],
                    onChanged: (String? value) async {
                      await settingsService.switchLang(value!);
                    },
                    icon: const Icon(
                      Icons.language,
                      color: Colors.white,
                    ),
                  )),
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
      height: 130,
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
          Obx(() => Text(
                userService.user.value?.username ?? 'null',
                style: const TextStyle(color: Colors.white),
              ))
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
        SidebarXItem(
          icon: Icons.person,
          label: 'sidebar-component.profile'.tr,
        ),
        SidebarXItem(
          icon: Icons.people_alt,
          label: 'sidebar-component.social'.tr,
        ),
        SidebarXItem(
          icon: Icons.question_mark,
          label: 'tuto'.tr,
        ),
      ];
    } else if (ModalRoute.of(context)!.settings.name == '/auth/login') {
      return [
        SidebarXItem(
          icon: Icons.home,
          label: 'sidebar-component.connect'.tr,
        ),
      ];
    } else if (ModalRoute.of(context)!.settings.name == '/auth/register') {
      return [
        SidebarXItem(
          icon: Icons.home,
          label: 'sidebar-component.register'.tr,
        ),
      ];
    } else if (ModalRoute.of(context)!.settings.name == '/home/game-start') {
      return [
        SidebarXItem(
          icon: Icons.settings,
          label: 'sidebar-game-options'.tr,
        ),
      ];
    } else if (ModalRoute.of(context)!.settings.name ==
        '/auth/register/avatar-selection') {
      return [
        SidebarXItem(
          icon: Icons.home,
          label: 'sidebar-game-avatar-choice'.tr,
        ),
      ];
    } else if (ModalRoute.of(context)!.settings.name == '/home/profile-edit') {
      return [
        SidebarXItem(
          icon: Icons.change_circle,
          label: 'modify-profil'.tr,
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
}
