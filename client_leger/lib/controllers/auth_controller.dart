import 'package:client_leger/api/api_repository.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AuthController extends GetxController {
  final ApiRepository apiRepository;
  AuthController({required this.apiRepository});

  // Register
  final GlobalKey<FormState> registerFormKey = GlobalKey<FormState>();
  final registerEmailController = TextEditingController();
  final registerPasswordController = TextEditingController();

  // Login
  final GlobalKey<FormState> loginFormKey = GlobalKey<FormState>();
  final loginEmailController = TextEditingController();
  final loginPasswordController = TextEditingController();

}