import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:client_leger/widgets/common.dart';
import 'package:client_leger/widgets/custom_button.dart';
import 'package:client_leger/widgets/app_sidebar.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:sidebarx/sidebarx.dart';

class AuthScreen extends GetView<AuthController> {
  const AuthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Builder(
        builder: (BuildContext context) => Scaffold(
              body: Row(
                children: [
                  appSideBar(controller: controller.sideBarController, isAuthScreen: true),
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
          return SingleChildScrollView(
            child: Center(
              child: SizedBox(
                width: 700,
                child: Column(
                  children: [
                    const Image(
                      image: AssetImage('assets/images/scrabble.png'),
                    ),
                    const Gap(20.0),
                    Text('authWelcome'.tr),
                    const Gap(10.0),
                    Text('authStart'.tr),
                    const Gap(50.0),
                    CustomButton(
                      text: 'authLoginBtn'.tr,
                      width: Get.width / 3,
                      onPressed: () {
                        Get.toNamed(Routes.AUTH + Routes.LOGIN,
                            arguments: controller);
                      },
                    ),
                    const Gap(20.0),
                    CustomButton(
                      text: 'authRegisterBtn'.tr,
                      width: Get.width / 3,
                      onPressed: () {
                        Get.toNamed(Routes.AUTH + Routes.REGISTER,
                            arguments: controller);
                      },
                    ),
                    const Gap(62.0),
                    const Text(''),
                  ],
                ),
              ),
            ),
          );
        });
  }
}
