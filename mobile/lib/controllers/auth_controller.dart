import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/utils/app_focus.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:client_leger/services/settings_service.dart';

class AuthController extends GetxController {
  final ApiRepository apiRepository;
  final SettingsService settingsService;
  AuthController({required this.apiRepository,required this.settingsService});

  // Register
  final GlobalKey<FormState> registerFormKey = GlobalKey<FormState>();
  final registerEmailController = TextEditingController();
  final registerPasswordController = TextEditingController();
  final registerUsernameController = TextEditingController();

  // Login
  final GlobalKey<FormState> loginFormKey = GlobalKey<FormState>();
  final loginEmailController = TextEditingController();
  final loginPasswordController = TextEditingController();

  Rx<IconData> getIconTheme () {
    return settingsService.currentThemeIcon;
  }

  void onThemeChange(){
    settingsService.switchTheme();
  }

  void login(BuildContext context) {
    AppFocus.unfocus(context);
    if (loginFormKey.currentState!.validate()) {
      Get.toNamed(Routes.HOME);
    }
    }

}