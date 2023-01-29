import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AuthController extends GetxController {
  final ApiRepository apiRepository;
  AuthController({required this.apiRepository});

  // Register
  final GlobalKey<FormState> registerFormKey = GlobalKey<FormState>();
  final registerEmailController = TextEditingController();
  final registerPasswordController = TextEditingController();
  final registerUsernameController = TextEditingController();

  // Login
  final GlobalKey<FormState> loginFormKey = GlobalKey<FormState>();
  final loginEmailController = TextEditingController();
  final loginPasswordController = TextEditingController();

  var currentIcon = Get.isDarkMode ? Icons.brightness_2.obs : Icons.wb_sunny.obs;


  @override
  void onClose() {
    super.onClose();
    registerEmailController.dispose();
    registerPasswordController.dispose();
    loginEmailController.dispose();
    loginPasswordController.dispose();
  }


  void login() {
    if (loginFormKey.currentState!.validate()) {
      Get.toNamed(Routes.HOME);
    }
    }

}