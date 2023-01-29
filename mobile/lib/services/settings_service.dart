import 'package:client_leger/app_theme.dart';
import 'package:client_leger/services/storage_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SettingsService extends GetxService {
  bool isDarkMode = Get.isDarkMode;
  bool isFrench = true;

  final StorageService storageService;
  SettingsService({required this.storageService});


  switchTheme() {
    isDarkMode = Get.isDarkMode ? false : true;
    Get.changeTheme(
        isDarkMode ? ThemeConfig.darkTheme : ThemeConfig.lightTheme);
    storageService.write('isDarkMode', isDarkMode);
  }

  bool loadTheme() {
    return storageService.read('isDarkMode') ?? false;
  }
}