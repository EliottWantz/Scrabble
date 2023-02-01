import 'package:client_leger/controllers/auth_controller.dart';
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CommonWidget.generalAppBar(controller.getIconTheme(),
          title: 'authLoginAppBar'.tr, callback: () {
        controller.onThemeChange();
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
                  Text(
                    'authLoginWelcome'.tr,
                  ),
                  const Gap(20.0),
                  InputField(
                    controller: controller.loginUsernameController,
                    keyboardType: TextInputType.text,
                    labelText: 'authUsernameLabel'.tr,
                    placeholder: 'authUsernamePlaceholder'.tr,
                  ),
                  const Gap(20.0),
                  InputField(
                    controller: controller.loginPasswordController,
                    keyboardType: TextInputType.text,
                    labelText: 'authPasswordLabel'.tr,
                    placeholder: 'authPasswordPlaceholder'.tr,
                    password: true,
                  ),
                  const Gap(50.0),
                  CustomButton(
                    text: 'authLoginBtn'.tr,
                    onPressed: () async {
                      await controller.onLogin(context);
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
