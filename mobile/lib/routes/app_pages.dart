import 'package:client_leger/bindings/auth_binding.dart';
import 'package:client_leger/bindings/avatar_selection_binding.dart';
import 'package:client_leger/bindings/game_binding.dart';
import 'package:client_leger/screens/auth/auth_screen.dart';
import 'package:client_leger/screens/game_screen.dart';
import 'package:client_leger/screens/home/game_lobby_screen.dart';
import 'package:client_leger/screens/home/game_start_screen.dart';
import 'package:client_leger/screens/auth/avatar_selection_screen.dart';
import 'package:client_leger/screens/home/home_screen.dart';
import 'package:client_leger/screens/auth/login_screen.dart';
import 'package:client_leger/screens/auth/register_screen.dart';
import 'package:client_leger/screens/home/profile_edit_screen.dart';
import 'package:get/get.dart';
import 'package:client_leger/bindings/chatbox_binding.dart';
import 'app_routes.dart';

class AppPages {
  static final List<GetPage> routes = [
    GetPage(
      name: Routes.AUTH,
      page: () => AuthScreen(),
      binding: AuthBinding(),
      children: [
        GetPage(
          name: Routes.REGISTER,
          page: () => RegisterScreen(),
          children: [
            GetPage(
              name: Routes.AVATAR_SELECTION,
              page: () => AvatarSelectionScreen(),
              binding: AvatarSelectionBinding(),
            ),
          ],
        ),
        GetPage(name: Routes.LOGIN, page: () => LoginScreen()),
      ],
    ),
    GetPage(
      name: Routes.HOME,
      page: () => HomeScreen(),
      binding: ChatBoxBinding(),
      children: [
        GetPage(
          name: Routes.GAME_START,
          page: () => GameStartScreen(),
          children: [
            GetPage(
              name: Routes.LOBBY,
              page: () => GameLobbyScreen(),
            ),
          ],
        ),
        GetPage(name: Routes.PROFILE_EDIT, page: () => ProfieEditScreen())
      ],
    ),
    GetPage(name: Routes.GAME, page: () => GameScreen(), binding: GameBinding())
  ];
}
