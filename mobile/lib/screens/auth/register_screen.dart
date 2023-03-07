import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/widgets/app_sidebar.dart';
import 'package:client_leger/widgets/custom_button.dart';
import 'package:client_leger/widgets/input_field.dart';
import 'package:flutter/material.dart';
import 'package:form_validator/form_validator.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

class RegisterScreen extends StatelessWidget {
  RegisterScreen({Key? key}) : super(key: key);
  final AuthController controller = Get.arguments;

  @override
  Widget build(BuildContext context) {
    return Builder(
        builder: (BuildContext context) => Scaffold(
              body: Row(
                children: [
                  AppSideBar(
                    controller: controller.sideBarController,
                  ),
                  Expanded(
                    child: _buildItems(
                      context,
                    ),
                  ),
                ],
              ),
            ));
  }

  Widget _buildItems(BuildContext context) {
    return AnimatedBuilder(
        animation: controller.sideBarController,
        builder: (context, child) {
          return Form(
            key: controller.registerFormKey,
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 40.0),
              child: Center(
                child: SizedBox(
                  width: 600,
                  child: Column(
                    children: [
                      Text(
                        'authRegisterWelcome'.tr,
                      ),
                      const Gap(20.0),
                      InputField(
                        controller: controller.registerEmailController,
                        keyboardType: TextInputType.text,
                        labelText: 'authEmailLabel'.tr,
                        placeholder: 'authEmailPlaceholder'.tr,
                        validator: ValidationBuilder(
                                requiredMessage:
                                    'Le champ ne peut pas être vide')
                            .email('Entrer un courriel valide')
                            .build(),
                      ),
                      const Gap(20.0),
                      InputField(
                        controller: controller.registerUsernameController,
                        keyboardType: TextInputType.text,
                        labelText: 'authUsernameLabel'.tr,
                        placeholder: 'authUsernamePlaceholder'.tr,
                        validator: ValidationBuilder(
                                requiredMessage:
                                    'Le champ ne peut pas être vide')
                            .minLength(3, 'trop petit')
                            .build(),
                      ),
                      const Gap(20.0),
                      InputField(
                        controller: controller.registerPasswordController,
                        keyboardType: TextInputType.emailAddress,
                        labelText: 'authPasswordLabel'.tr,
                        placeholder: 'authPasswordPlaceholder'.tr,
                        password: true,
                        validator: ValidationBuilder(
                                requiredMessage:
                                    'Le champ ne peut pas être vide')
                            .regExp(
                                RegExp(
                                    r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,}$'),
                                'Veuillez entrez un mot de passe valide')
                            .build(),
                      ),
                      const Gap(50.0),
                      CustomButton(
                        text: 'Choisir son Avatar',
                        onPressed: () {
                          controller.onAvatarClick(context);
                        },
                      ),
                      const Gap(50.0),
                    ],
                  ),
                ),
              ),
            ),
          );
        });
  }
}
