import 'package:client_leger/bindings/auth_binding.dart';
import 'package:client_leger/screens/auth/auth_screen.dart';
import 'package:client_leger/screens/avatar_selection_screen.dart';
import 'package:client_leger/screens/home_screen.dart';
import 'package:client_leger/screens/auth/login_screen.dart';
import 'package:client_leger/screens/auth/register_screen.dart';
import 'package:get/get.dart';
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
            page: () => RegisterScreen()),
        GetPage(name: Routes.LOGIN, page: () => LoginScreen()),
      ],
    ),
    GetPage(
      name: Routes.HOME,
      page: () => HomeScreen(),
    ),
    GetPage(
        name: Routes.AVATAR_SELECTION,
        page: () => AvatarSelectionScreen()),
  ];
}
