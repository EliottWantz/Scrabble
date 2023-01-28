import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

class AuthScreen extends GetView<AuthController> {
  const AuthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        minimum: const EdgeInsets.symmetric(horizontal: 30.0),
        child: Center(
          child: Column(
            children: [
              Gap(Get.height/5),
              const Image(
                image: AssetImage('assets/images/scrabble.png'),width: 700,
              ),
              const Gap(20.0),
              const Text('Bienvenue a PolyScrabble'),
              const Gap(10.0),
              const Text('Commençons'),
              const Gap(50.0),
              CustomButton(
                text: 'Se connecter',
                width: Get.width/3,
                onPressed: () {
                  Get.toNamed(Routes.AUTH + Routes.LOGIN);
                },
              ),
              const Gap(20.0),
              CustomButton(
                text: 'S\'inscrire',
                width: Get.width/3,
                onPressed: () {
                  Get.toNamed(Routes.AUTH + Routes.REGISTER);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
