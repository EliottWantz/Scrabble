import 'dart:io';

import 'package:client_leger/models/requests/login_request.dart';
import 'package:client_leger/models/requests/register_request.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/auth_service.dart';
import 'package:client_leger/services/avatar_service.dart';
import 'package:client_leger/utils/app_focus.dart';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:sidebarx/sidebarx.dart';

class AuthController extends GetxController {
  final SettingsService settingsService;
  final AuthService authService;
  final AvatarService avatarService;

  AuthController(
      {required this.settingsService,
      required this.authService,
      required this.avatarService});

  @override
  void onInit() {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual,
        overlays: [SystemUiOverlay.bottom]);
    super.onInit();
  }

  // Register
  final GlobalKey<FormState> registerFormKey = GlobalKey<FormState>();
  final registerEmailController = TextEditingController();
  final registerPasswordController = TextEditingController();
  final registerUsernameController = TextEditingController();

  // Login
  final GlobalKey<FormState> loginFormKey = GlobalKey<FormState>();
  final loginUsernameController = TextEditingController();
  final loginPasswordController = TextEditingController();

  final sideBarController =
      SidebarXController(selectedIndex: 0, extended: true);

  Rx<IconData> getIconTheme() {
    return settingsService.currentThemeIcon;
  }

  void onThemeChange() {
    settingsService.switchTheme();
  }

  Future<void> onLogin(BuildContext context) async {
    AppFocus.unfocus(context);
    if (loginFormKey.currentState!.validate()) {
      final request = LoginRequest(
          username: loginUsernameController.text,
          password: loginPasswordController.text);
      await DialogHelper.showLoading('Connexion au serveur');
      await authService.login(request);
      if (authService.isUserLoggedIn()) {
        Get.offAllNamed(Routes.HOME);
      }
    }
  }

  void onAvatarClick(BuildContext context) {
    AppFocus.unfocus(context);
    if (registerFormKey.currentState!.validate()) {
      Get.toNamed(Routes.AUTH + Routes.REGISTER + Routes.AVATAR_SELECTION,
          arguments: this);
    }
  }

  Future<void> onRegister() async {
    final request = RegisterRequest(
        email: registerEmailController.text,
        username: registerUsernameController.text,
        password: registerPasswordController.text,
        avatar: avatarService.isAvatar.value
            ? avatarService.avatars[avatarService.currentAvatarIndex.value]
            : null);
    await DialogHelper.showLoading('Connexion au serveur');
    await authService.register(request,
        imagePath: avatarService.isAvatar.value == false
            ? File(avatarService.image.value!.path)
            : null);
    if (authService.isUserLoggedIn()) {
      Get.offAllNamed(Routes.HOME);
    }
  }
}
