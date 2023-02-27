import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/controllers/avatar_controller.dart';
import 'package:get/get.dart';


class AvatarSelectionBinding implements Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AvatarController>(
            () => AvatarController(avatarService: Get.find()));
  }
}