import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/auth_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AuthGuard extends GetMiddleware {
  final authService = Get.find<AuthService>();

  @override
  RouteSettings? redirect(String? route) {
    return authService.isUserLoggedIn()
        ? null
        : const RouteSettings(name: Routes.AUTH);
  }
}
