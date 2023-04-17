import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/widgets/app_sidebar.dart';
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
                      Text('authRegisterWelcome'.tr,
                          style: Theme.of(context).textTheme.headline6),
                      const Gap(20.0),
                      InputField(
                        controller: controller.registerEmailController,
                        keyboardType: TextInputType.text,
                        labelText: 'authEmailLabel'.tr,
                        placeholder: 'authEmailPlaceholder'.tr,
                        validator:
                            ValidationBuilder(requiredMessage: 'field-empty'.tr)
                                .email('email-empty'.tr)
                                .build(),
                      ),
                      const Gap(20.0),
                      InputField(
                        controller: controller.registerUsernameController,
                        keyboardType: TextInputType.text,
                        labelText: 'authUsernameLabel'.tr,
                        placeholder: 'authUsernamePlaceholder'.tr,
                        validator:
                            ValidationBuilder(requiredMessage: 'field-empty'.tr)
                                .build(),
                      ),
                      const Gap(20.0),
                      InputField(
                        controller: controller.registerPasswordController,
                        keyboardType: TextInputType.emailAddress,
                        labelText: 'authPasswordLabel'.tr,
                        placeholder: 'authPasswordPlaceholder'.tr,
                        password: true,
                        validator:
                            ValidationBuilder(requiredMessage: 'field-empty'.tr)
                                .build(),
                      ),
                      const Gap(50.0),
                      ElevatedButton.icon(
                        onPressed: () {
                          controller.onAvatarClick(context);
                        },
                        icon: const Icon(
                          Icons.perm_identity_sharp,
                          size: 50,
                        ),
                        label:
                            Text('avatar-selection-component.bouton-custom'.tr),
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
