import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/utils/dialog_helper.dart';
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
                  AppSideBar(controller: controller.sideBarController),
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
                    Image(
                      image: controller.settingsService.getLogo(),
                    ),
                    const Gap(20.0),
                    Text('authWelcome'.tr,style: Theme.of(context).textTheme.headline6,),
                    const Gap(10.0),
                    Text('authStart'.tr,style: Theme.of(context).textTheme.headline6),
                    const Gap(50.0),
                    ElevatedButton.icon(
                      onPressed: () {
                        Get.toNamed(Routes.AUTH + Routes.LOGIN,
                            arguments: controller);
                      }, icon: const Icon(Icons.login,size: 50,),
                      label: Text('authLoginBtn'.tr),
                    ),
                    const Gap(50.0),
                    ElevatedButton.icon(
                      onPressed: () {
                        Get.toNamed(Routes.AUTH + Routes.REGISTER,
                            arguments: controller);
                      }, icon: const Icon(Icons.app_registration,size: 50,),
                      label: Text('authRegisterBtn'.tr),
                    ),
                    const Gap(62.0),
                  ],
                ),
              ),
            ),
          );
        });
  }
}
