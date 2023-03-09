import 'dart:io';

import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/controllers/avatar_controller.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/auth_service.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/services/storage_service.dart';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:client_leger/widgets/app_sidebar.dart';
import 'package:client_leger/widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:path_provider/path_provider.dart';

class AvatarSelectionScreen extends GetView<AvatarController> {
  AvatarSelectionScreen({Key? key}) : super(key: key);
  final StorageService storageService = Get.find();
  final AuthController authController = Get.arguments;

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
    return SafeArea(
      minimum: const EdgeInsets.symmetric(horizontal: 40.0),
      child: Center(
        child: SizedBox(
          width: 400,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Choisisez un avatar qui vous correspond',
                  style: Theme.of(context).textTheme.headline6),
              const Gap(8),
              Text(
                'Les photos rendent votre profil plus attrayant',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const Gap(50),
              Obx(() => CircleAvatar(
                  maxRadius: 60,
                  backgroundColor: Colors.transparent,
                  backgroundImage: controller.getAvatarToDisplay(),
                 )),
              const Gap(50),
              CustomButton(
                text: 'Choisir un avatar',
                onPressed: () {
                  _showAvatarOptionsDialog(context);
                },
              ),
              const Gap(20),
              Text(
                'Ou',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const Gap(20),
              CustomButton(
                text: 'Prenez votre avatar en photo',
                onPressed: () async {
                  await controller.onTakePicture();
                },
              ),
              const Gap(20),
              Text(
                'Ou',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const Gap(20),
              CustomButton(
                text: 'Personnaliser votre avatar',
                onPressed: () {},
              ),
              const Gap(60),
              CustomButton(
                  text: 'S\'inscrire',
                  onPressed: () async {
                    await authController.onRegister();
                  })
            ],
          ),
        ),
      ),
    );
  }

  void _showAvatarOptionsDialog(BuildContext context) {
    Get.dialog(
      Dialog(
        child: SizedBox(
          height: 500,
          width: 600,
          child: Column(
            children: [
              const Gap(10),
              Text('Selection des avatars',
                  style: Theme.of(context).textTheme.headline6),
              const Gap(10),
              Expanded(
                child: GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      mainAxisSpacing: 20,
                      crossAxisSpacing: 20,
                      crossAxisCount: 3,
                      childAspectRatio: 1,
                    ),
                    shrinkWrap: false,
                    itemCount: controller.avatarService.avatars.length,
                    scrollDirection: Axis.vertical,
                    itemBuilder: (BuildContext context, int index) {
                      return Obx(
                        () => InkWell(
                          onTap: () {
                            controller.avatarService.currentAvatarIndex.value =
                                index;
                          },
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(20),
                              border: controller.avatarService
                                          .currentAvatarIndex.value ==
                                      index
                                  ? null
                                  : Border.all(color: Colors.grey.shade600),
                              boxShadow: controller.avatarService
                                          .currentAvatarIndex.value ==
                                      index
                                  ? const [
                                      BoxShadow(
                                        color: Colors.green,
                                        blurRadius: 12.0,
                                      ),
                                    ]
                                  : null,
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(20),
                              child: SizedBox.fromSize(
                                size: const Size.fromRadius(48),
                                // Image radius
                                child: Image.network(
                                  controller.avatarService.avatars[index].url,
                                  fit: BoxFit.fill,
                                  loadingBuilder: (BuildContext context,
                                      Widget child,
                                      ImageChunkEvent? loadingProgress) {
                                    if (loadingProgress == null) return child;
                                    return Center(
                                      child: CircularProgressIndicator(
                                        value: loadingProgress
                                                    .expectedTotalBytes !=
                                                null
                                            ? loadingProgress
                                                    .cumulativeBytesLoaded /
                                                loadingProgress
                                                    .expectedTotalBytes!
                                            : null,
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    }),
              ),
              const Gap(10),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton(
                      style: TextButton.styleFrom(
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: const BorderSide(color: Colors.black))),
                      onPressed: () {
                        DialogHelper.hideLoading();
                        controller.avatarService.isAvatar.value = true;
                      },
                      child: const Text('Confirmer')),
                  const Gap(10),
                  TextButton(
                      style: TextButton.styleFrom(
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: const BorderSide(color: Colors.black))),
                      onPressed: () async {
                        DialogHelper.hideLoading();
                        await Future.delayed(const Duration(seconds: 1));
                        controller.avatarService.currentAvatarIndex.value = 0;
                      },
                      child: const Text('Annuler')),
                ],
              ),
              const Gap(10),
            ],
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }
}
