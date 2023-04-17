
import 'package:client_leger/services/auth_service.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

class HomeController extends GetxController {
  final AuthService authService;

  HomeController({required this.authService});

  @override
  void onInit() {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual,
        overlays: [SystemUiOverlay.bottom]);
    super.onInit();
  }



}