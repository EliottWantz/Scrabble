import 'package:client_leger/controllers/auth_controller.dart';
import 'package:get/get.dart';


class AuthBinding implements Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AuthController>(
            () => AuthController(authService: Get.find(),settingsService: Get.find()));
  }
}