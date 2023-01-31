import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/widgets/common.dart';
import 'package:client_leger/widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

class AvatarSelectionScreen extends StatelessWidget {
  AvatarSelectionScreen({Key? key}) : super(key: key);
  final AuthController controller = Get.arguments;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CommonWidget.authAppBar(controller.getIconTheme(), callback: () {
        controller.onThemeChange();
      }, title: 'Choix de l\'avatar'),
      body: SafeArea(
        minimum: EdgeInsets.symmetric(horizontal: 40.0),
        child: Center(
          child: SizedBox(
            width: 300,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CustomButton(text:'Choisir un avatar',),
                Gap(20),
                CustomButton(text:'Choisir un avatar de votre pellicule',),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
