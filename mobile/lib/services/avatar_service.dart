import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/models/avatar.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

class AvatarService extends GetxService {
  final ApiRepository apiRepository = Get.find();
  late List<Avatar> avatars;
  late XFile image;
  RxInt currentAvatarIndex = 0.obs;
  RxBool isAvatar = true.obs;

  final ImagePicker _picker = ImagePicker();

  @override
  Future<void> onReady() async {
    avatars = (await apiRepository.avatars())!;
    super.onReady();
  }

  Future<void> takePicture() async {
    try {
      XFile? imageFile = await _picker.pickImage(
          source: ImageSource.camera,
          preferredCameraDevice: CameraDevice.front);
      if (imageFile != null) {
        image = imageFile;
        isAvatar.value = false;
      }
    } catch (e) {
      return;
    }
  }
}
