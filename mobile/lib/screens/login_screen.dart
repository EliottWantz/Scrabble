import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/widgets/common.dart';
import 'package:client_leger/widgets/custom_button.dart';
import 'package:client_leger/widgets/input_field.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

class LoginScreen extends StatelessWidget {
  LoginScreen({Key? key}) : super(key: key);

  final AuthController controller = Get.arguments;
  final SettingsService settingsService = Get.find();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CommonWidget.authAppBar(controller.currentIcon,
          title: 'Connexion a PolyScrabble', callback: () {
        settingsService.switchTheme();
        controller.currentIcon.value =
            Get.isDarkMode ? Icons.wb_sunny : Icons.brightness_2;
      }),
      body: SafeArea(
        minimum: const EdgeInsets.all(40),
        child: Form(
          key: controller.loginFormKey,
          child: Center(
            child: SizedBox(
              width: 600,
              child: Column(
                children: [
                  Gap(Get.height / 4),
                  const Text(
                    'Content de vous revoir, veuillez vous connecter',
                  ),
                  const Gap(20.0),
                  InputField(
                    controller: controller.loginEmailController,
                    keyboardType: TextInputType.text,
                    labelText: 'Adresse courriel',
                    placeholder: 'Entrer une adresse courriel',
                  ),
                  const Gap(20.0),
                  InputField(
                    controller: controller.loginPasswordController,
                    keyboardType: TextInputType.emailAddress,
                    labelText: 'Password',
                    placeholder: 'Entrer votre mot de passe',
                    password: true,
                    validator: (value) {},
                  ),
                  const Gap(50.0),
                  CustomButton(
                    text: 'Se connecter',
                    onPressed: () {
                      controller.login();
                    },
                  )
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
