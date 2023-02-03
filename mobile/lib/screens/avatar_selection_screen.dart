import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/services/auth_service.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/services/storage_service.dart';
import 'package:client_leger/widgets/app_sidebar.dart';
import 'package:client_leger/widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

class AvatarSelectionScreen extends StatelessWidget {
  AvatarSelectionScreen({Key? key}) : super(key: key);
  final AuthController controller = Get.arguments;
  final StorageService storageService = Get.find();

  @override
  Widget build(BuildContext context) {
    return Builder(
        builder: (BuildContext context) => Scaffold(
              body: Row(
                children: [
                  AppSideBar(
                      controller: controller.sideBarController,
                      isAuthScreen: true),
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
    return SafeArea(
      minimum: const EdgeInsets.symmetric(horizontal: 40.0),
      child: Center(
        child: SizedBox(
          width: 300,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              CustomButton(
                text: 'Choisir un avatar',
              ),
              Gap(20),
              CustomButton(
                text: 'Choisir un avatar de votre pellicule',
              ),
            ],
          ),
        ),
      ),
    );
  }
}