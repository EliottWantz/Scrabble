import 'package:client_leger/api/api_provider.dart';
import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/app_theme.dart';
import 'package:client_leger/controllers/chatbox_controller.dart';
import 'package:client_leger/lang/tanslation_service.dart';
import 'package:client_leger/routes/app_pages.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/auth_service.dart';
import 'package:client_leger/services/avatar_service.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/services/room_service.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/services/storage_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/services/users_service.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:timezone/data/latest.dart' as tz;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initGlobalServices();
  tz.initializeTimeZones();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.landscapeRight,
    DeviceOrientation.landscapeLeft,
  ]);
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  await SystemChrome.setSystemUIChangeCallback(
      (systemOverlaysAreVisible) async {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  });
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
      locale: TranslationService.locale,
      fallbackLocale: TranslationService.fallbackLocale,
      translations: TranslationService(),
    );
  }
}

Future<void> initGlobalServices() async {
  await Get.putAsync(() => StorageService().init());
  Get.put(UserService());
  Get.put(ApiProvider(), permanent: true);
  Get.put(ApiRepository(apiProvider: Get.find()), permanent: true);
  Get.put(GameService());
  Get.put(RoomService());
  Get.put(GameService());
  Get.put(UsersService());
  Get.put(
      WebsocketService(
        userService: Get.find(),
        usersService: Get.find(),
        roomService: Get.find(),
      ),
      permanent: false);
  Get.put(SettingsService());
  Get.put(AvatarService());
  Get.put(AuthService(
      storageService: Get.find(),
      apiRepository: Get.find(),
      websocketService: Get.find(),
      userService: Get.find(),
      avatarService: Get.find()));
}
