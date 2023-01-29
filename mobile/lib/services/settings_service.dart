import 'package:client_leger/app_theme.dart';
import 'package:client_leger/services/storage_service.dart';
import 'package:get/get.dart';

class SettingsService extends GetxService {
  bool isDarkMode = false;
  bool isFrench = true;

  StorageService storageService = Get.find();

  switchTheme() {
    isDarkMode = Get.isDarkMode ? false : true;
    Get.changeTheme(
        isDarkMode ? ThemeConfig.darkTheme : ThemeConfig.lightTheme);
    storageService.write('key', isDarkMode);
  }

  bool loadTheme() {
    return storageService.read('key') ?? false;
  }
}