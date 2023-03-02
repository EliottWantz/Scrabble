import 'dart:io';

import 'package:client_leger/api/api_provider.dart';
import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/models/response/avatar_upload_response.dart';
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


  AvatarController({required this.avatarService});

  int get avatarIndex => avatarService.currentAvatarIndex.value;

  set avatarIndex(int index) => avatarService.currentAvatarIndex.value = index;

  final sideBarController =
      SidebarXController(selectedIndex: 0, extended: true);

  Future<void> onTakePicture() async {
    final image = await avatarService.takePicture();
    if (image != null) {
      DialogHelper.showLoading('Connexion au Serveur');
      final avatar = await apiRepository.upload(File(image.path));
      if (avatar != null) {
        avatarService.isAvatar.value = false;
        avatarService.imageUrl.value = avatar.url;
      }
    }
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
