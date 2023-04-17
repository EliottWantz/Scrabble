import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/widgets/app_sidebar.dart';
import 'package:client_leger/widgets/custom_button.dart';
import 'package:client_leger/widgets/input_field.dart';
import 'package:flutter/material.dart';
import 'package:form_validator/form_validator.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

class LoginScreen extends StatelessWidget {
  LoginScreen({Key? key}) : super(key: key);

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
            key: controller.loginFormKey,
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 40.0),
              child: Center(
                child: SizedBox(
                  width: 600,
                  child: Column(
                    children: [
                      Text(
                        'authLoginWelcome'.tr,
                          style: Theme.of(context).textTheme.headline6
                      ),
                      const Gap(20.0),
                      InputField(
                          controller: controller.loginUsernameController,
                          keyboardType: TextInputType.text,
                          labelText: 'authUsernameLabel'.tr,
                          placeholder: 'authUsernamePlaceholder'.tr,
                          validator: ValidationBuilder(
                                  requiredMessage:
                                      'Le champ ne peut pas être vide')
                              .build()),
                      const Gap(20.0),
                      InputField(
                        controller: controller.loginPasswordController,
                        keyboardType: TextInputType.text,
                        labelText: 'authPasswordLabel'.tr,
                        placeholder: 'authPasswordPlaceholder'.tr,
                        password: true,
                        validator: ValidationBuilder(
                                requiredMessage:
                                    'Le champ ne peut pas être vide')
                            .build(),
                      ),
                      const Gap(50.0),
                      ElevatedButton.icon(
                        onPressed: () async {
                          await controller.onLogin(context);
                        }, icon: const Icon(Icons.login,size: 50,),
                        label: Text('authLoginBtn'.tr),
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
