import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/models/avatar.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

class AvatarService extends GetxService {
  final ApiRepository apiRepository = Get.find();
  final image = Rxn<XFile>();
  RxInt currentAvatarIndex = 0.obs;
  RxBool isAvatar = true.obs;

  final ImagePicker _picker = ImagePicker();

  Future<void> takePicture() async {
    try {
      XFile? imageFile = await _picker.pickImage(
          source: ImageSource.camera,
          preferredCameraDevice: CameraDevice.front);
      if (imageFile != null) {
        image.value = imageFile;
        isAvatar.value = false;
      }
    } catch (e) {
      return;
    }
  }
}
