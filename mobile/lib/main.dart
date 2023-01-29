import 'package:client_leger/api/api_provider.dart';
import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/app_theme.dart';
import 'package:client_leger/routes/app_pages.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/services/storage_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

Future<void> main() async{
  WidgetsFlutterBinding.ensureInitialized();
  await initGlobalServices();
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  MyApp({super.key});

  final SettingsService settingsService = Get.find();

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'PolyScrabble',
      theme: ThemeConfig.lightTheme,
      defaultTransition: Transition.fade,
      debugShowCheckedModeBanner: false,
      initialRoute: Routes.AUTH,
      getPages: AppPages.routes,
    );
  }
}

Future<void> initGlobalServices() async {
  await Get.putAsync(() => StorageService().init());
  Get.put(ApiProvider(), permanent: true);
  Get.put(ApiRepository(apiProvider: Get.find()), permanent: true);
  Get.put(SettingsService(storageService: Get.find()));
}
