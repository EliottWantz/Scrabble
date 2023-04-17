import 'dart:io';
import 'dart:math';

import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/models/avatar.dart';
import 'package:client_leger/models/requests/update_username_request.dart';
import 'package:client_leger/models/requests/upload_avatar_request.dart';
import 'package:client_leger/services/avatar_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/utils/app_focus.dart';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:sidebarx/sidebarx.dart';

class AvatarController extends GetxController {
  final AvatarService avatarService;
  final ApiRepository apiRepository = Get.find();
  final UserService userService = Get.find();
  final RxBool isFirst = true.obs;

  RxBool isAvatarCustomizable = false.obs;
  RxInt currentStep = 0.obs;
  Rx<String> gender = 'Baby'.obs;
  Rx<Color> skinColor = const Color(0xFFFFDBB4).obs;
  Rx<String> hairType = 'straightAndStrand'.obs;
  Rx<Color> hairColor = const Color(0xFFFFDBB4).obs;
  Rx<String> eyeType = 'default'.obs;
  Rx<String> eyeBrows = 'default'.obs;
  Rx<String> facialHair = 'beardLight'.obs;
  Rx<Color> facialHairColor = const Color(0xFFFFDBB4).obs;
  Rx<String> mouth = 'default'.obs;
  Rx<String> accessories = 'none'.obs;
  Rx<Color> backgroundColor = const Color(0xFFb6e3f4).obs;

  AvatarController({required this.avatarService});

  // Login
  final GlobalKey<FormState> profileEditFormKey = GlobalKey<FormState>();
  final usernameEditController = TextEditingController();

  final sideBarController =
      SidebarXController(selectedIndex: 0, extended: true);

  String onGenerateAvatar() {
    String baseUrl =
        'https://api.dicebear.com/6.x/avataaars/png?seed=$gender&skinColor=${formatColor(skinColor.value)}&top=$hairType&mouth=$mouth&hairColor=${formatColor(hairColor.value)}&eyes=$eyeType&eyebrows=$eyeBrows${facialHair.value != 'none' ? '&facialHair=$facialHair&facialHairProbability=100&facialHairColor=${formatColor(facialHairColor.value)}' : ''}&backgroundColor=${formatColor(backgroundColor.value)}${accessories.value != 'none' ? '&accessories=$accessories&accessoriesProbability=100' : ''}';
    return baseUrl;
  }

  String formatColor(Color color) {
    return color.value.toRadixString(16).substring(2);
  }

  Future<void> onTakePicture() async {
    await avatarService.takePicture();
    isFirst.value = false;
  }

  ImageProvider getAvatarToDisplay(List<Avatar> avatars) {
    if (isFirst.value && userService.user.value != null) {
      return NetworkImage(userService.user.value!.avatar.url);
    } else if (avatarService.isAvatar.value) {
      return NetworkImage(isAvatarCustomizable.value
          ? onGenerateAvatar()
          : avatars[avatarService.currentAvatarIndex.value].url);
    } else {
      return FileImage(File(avatarService.image.value!.path));
    }
  }

  Future<void> onProfileChange(BuildContext context) async {
    AppFocus.unfocus(context);
    if (profileEditFormKey.currentState!.validate() &&
        userService.user.value != null) {
      final request = UpdateUsernameRequest(
          username: usernameEditController.text,
          id: userService.user.value!.id);
      await DialogHelper.showLoading('Modification du pseudonyme');
      await apiRepository.username(request);
      usernameEditController.clear();
    }
  }

  Future<void> onAvatarChange(List<Avatar> avatars) async {
    if (userService.user.value != null) {
      String avatarUrl = '';
      if (avatarService.isAvatar.value && !isAvatarCustomizable.value) {
        avatarUrl = avatars[avatarService.currentAvatarIndex.value].url;
      } else if (avatarService.isAvatar.value && isAvatarCustomizable.value) {
        avatarUrl = onGenerateAvatar();
      }
      final request = UploadAvatarRequest(
          avatarUrl: avatarUrl,
          id: userService.user.value!.id,
          fileId: (avatarService.isAvatar.value && !isAvatarCustomizable.value)
              ? avatars[avatarService.currentAvatarIndex.value].fileId
              : '');
      await DialogHelper.showLoading('Modification de l\'avatar');
      await apiRepository.upload(request,
          imagePath: avatarService.isAvatar.value
              ? null
              : File(avatarService.image.value!.path));
    }
  }
}
