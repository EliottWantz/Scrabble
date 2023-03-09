import 'dart:io';

import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/services/avatar_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:sidebarx/sidebarx.dart';

class AvatarController extends GetxController {
  final AvatarService avatarService;
  final ApiRepository apiRepository = Get.find();
  final UserService userService = Get.find();

  AvatarController({required this.avatarService});

  final sideBarController =
      SidebarXController(selectedIndex: 0, extended: true);

  Future<void> onTakePicture() async {
    await avatarService.takePicture();
  }

  ImageProvider getAvatarToDisplay() {
    if (avatarService.isAvatar.value) {
      return NetworkImage(
          avatarService.avatars[avatarService.currentAvatarIndex.value].url);
    } else {
      return FileImage(File(avatarService.image.value!.path));
    }
  }
}
