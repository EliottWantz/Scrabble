import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/app_theme.dart';
import 'package:client_leger/services/storage_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SettingsService extends GetxService {
  bool isFrench = true;
  RxString currentLangValue = 'fr'.obs;
  Rx<IconData> currentThemeIcon =
      Get.isDarkMode ? Icons.wb_sunny.obs : Icons.brightness_2.obs;
  final ApiRepository apiRepository = Get.find();
  final UserService userService = Get.find();
  final StorageService storageService = Get.find();

  Future<void> switchTheme() async {
    Get.changeTheme(
        Get.isDarkMode ? ThemeConfig.lightTheme : ThemeConfig.darkTheme);
    currentThemeIcon.value =
        Get.isDarkMode ? Icons.brightness_2 : Icons.wb_sunny;

    if (storageService.read('token') != null) {
      userService.user.value!.preferences.theme =
          Get.isDarkMode ? 'light' : 'dark';
      await apiRepository.preferences();
    }
  }

  Future<void> switchLang(String value) async {
    currentLangValue.value = value;
    Locale changedLocale = currentLangValue.value == 'fr'
        ? const Locale('fr', 'FR')
        : const Locale('en', 'US');
    await Get.updateLocale(changedLocale);
    if (storageService.read('token') != null) {
      userService.user.value!.preferences.language = currentLangValue.value;
      await apiRepository.preferences();
    }
  }
}
