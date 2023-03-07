import 'dart:io';
import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/services/avatar_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:sidebarx/sidebarx.dart';

class AvatarController extends GetxController {
  final AvatarService avatarService;
  final ApiRepository apiRepository = Get.find();
  final UserService userService = Get.find();
  late XFile image;


  AvatarController({required this.avatarService});

  int get avatarIndex => avatarService.currentAvatarIndex.value;

  set avatarIndex(int index) => avatarService.currentAvatarIndex.value = index;

  final sideBarController =
      SidebarXController(selectedIndex: 0, extended: true);

  Future<void> onTakePicture() async {
    image = (await avatarService.takePicture())!;
  }

  Future<void> onAvatarConfirmation() async {
    DialogHelper.hideLoading();
    avatarService.isAvatar.value = true;
  }

  ImageProvider getAvatarToDisplay() {
    if (avatarService.isAvatar.value) {
      return AssetImage('assets/images/avatar($avatarIndex).png');
    } else {
      return NetworkImage(avatarService.imageUrl.value);
    }
  }
}
