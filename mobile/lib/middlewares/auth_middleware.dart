import 'package:client_leger/routes/app_routes.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AuthGuard extends GetMiddleware {
  // final authService = Get.find<AuthService>();

  @override
  RouteSettings? redirect(String? route) {
    return const RouteSettings(name: Routes.AUTH);
    // return authService.isPremium.value
    //     ? null
    //     : const RouteSettings(name: Routes.AUTH);
  }
}