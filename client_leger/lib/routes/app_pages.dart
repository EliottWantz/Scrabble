import 'package:client_leger/screens/auth_screen.dart';
import 'package:client_leger/screens/login_screen.dart';
import 'package:client_leger/screens/register_screen.dart';
import 'package:get/get.dart';
import 'app_routes.dart';

class AppPages {
  static final List<GetPage> routes = [
    GetPage(
      name: Routes.AUTH,
      page: () => const AuthScreen(),
      children: [
        GetPage(name: Routes.REGISTER, page: () => const RegisterScreen()),
        GetPage(name: Routes.LOGIN, page: () => const LoginScreen()),
      ],
    ),
  ];
}