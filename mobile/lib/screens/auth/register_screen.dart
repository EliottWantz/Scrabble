import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/widgets/common.dart';
import 'package:client_leger/widgets/custom_button.dart';
import 'package:client_leger/widgets/input_field.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

class RegisterScreen extends StatelessWidget {
  RegisterScreen({Key? key}) : super(key: key);
  final AuthController controller = Get.arguments;
  final SettingsService settingsService = Get.find();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CommonWidget.authAppBar(controller.getIconTheme(),
          title: 'authRegisterAppBar'.tr, callback: () {
        controller.onThemeChange();
      }),
      body: SafeArea(
        minimum: const EdgeInsets.all(40),
        child: Form(
          key: controller.registerFormKey,
          child: Center(
            child: SizedBox(
              width: 600,
              child: Column(
                children: [
                  Gap(Get.height / 4),
                  Text(
                    'authRegisterWelcome'.tr,
                  ),
                  const Gap(20.0),
                  InputField(
                    controller: controller.registerEmailController,
                    keyboardType: TextInputType.text,
                    labelText: 'authEmailLabel'.tr,
                    placeholder: 'authEmailPlaceholder'.tr,
                  ),
                  const Gap(20.0),
                  InputField(
                    controller: controller.registerUsernameController,
                    keyboardType: TextInputType.text,
                    labelText: 'authUsernameLabel'.tr,
                    placeholder: 'authUsernamePlaceholder'.tr,
                  ),
                  const Gap(20.0),
                  InputField(
                    controller: controller.registerPasswordController,
                    keyboardType: TextInputType.emailAddress,
                    labelText: 'authPasswordLabel'.tr,
                    placeholder: 'authPasswordPlaceholder'.tr,
                    password: true,
                    validator: (value) {},
                  ),
                  const Gap(50.0),
                  CustomButton(
                    text: 'authRegisterBtn'.tr,
                    onPressed: () {
                      Get.toNamed(Routes.AVATAR_SELECTION,
                          arguments: controller);
                    },
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
