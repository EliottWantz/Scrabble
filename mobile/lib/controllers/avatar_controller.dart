import 'dart:io';

import 'package:client_leger/api/api_provider.dart';
import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/services/avatar_service.dart';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sidebarx/sidebarx.dart';

class AvatarController extends GetxController {
  final AvatarService avatarService;
  final ApiRepository apiRepository = Get.find();
  Rx<File> imagePath = File('').obs;

  AvatarController({required this.avatarService});

  int get avatarIndex => avatarService.currentAvatarIndex.value;

  set avatarIndex(int index) => avatarService.currentAvatarIndex.value = index;

  final sideBarController =
      SidebarXController(selectedIndex: 0, extended: true);

  Future<void> onTakePicture() async {
    final image = await avatarService.takePicture();
    if (image != null) {
      imagePath.value = File(image.path);
      avatarService.isAvatar.value = false;
    }
  }

  Future<void> onAvatarConfirmation() async {
    DialogHelper.hideLoading();
    avatarService.isAvatar.value = true;
    imagePath.value =  File('');
    // Directory directory = await getApplicationDocumentsDirectory();
    // final currentImagePath = join(directory.path, "assets/images/avatar($avatarIndex).png");
    // imagePath = File(currentImagePath);
  }

  ImageProvider getAvatarToDisplay() {
    if (avatarService.isAvatar.value) {
      return AssetImage('assets/images/avatar($avatarIndex).png');
    }
    else {
      return FileImage(imagePath.value);
    }
  }
}
