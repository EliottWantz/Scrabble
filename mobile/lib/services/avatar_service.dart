import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

class AvatarService extends GetxService {
  RxBool isAvatar = true.obs;
  RxString imageUrl = ''.obs;
  RxInt currentAvatarIndex = 0.obs;
  final ImagePicker _picker = ImagePicker();

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
