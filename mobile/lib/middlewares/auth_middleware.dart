import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/auth_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AuthGuard extends GetMiddleware {
  final authService = Get.find<AuthService>();

  @override
  RouteSettings? redirect(String? route) {
    if (authService.isUserLoggedIn()) {
      return null;
    } else if (Get.isRegistered<AuthController>()) {
      Get.lazyReplace<AuthController>(() =>
          AuthController(settingsService: Get.find(), authService: Get.find()));
      return const RouteSettings(name: Routes.AUTH);
    }
  }
}
