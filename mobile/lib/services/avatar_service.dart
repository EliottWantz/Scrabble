import 'dart:io';

import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';

class AvatarService extends GetxService {
  RxBool isAvatar = true.obs;
  final ImagePicker _picker = ImagePicker();
  RxInt currentAvatarIndex = 0.obs;


  Future<XFile?> takePicture() async {
    try {
      return await _picker.pickImage(
          source: ImageSource.camera,
          preferredCameraDevice: CameraDevice.front);
    } catch (e) {
      return null;
    }
  }
}
