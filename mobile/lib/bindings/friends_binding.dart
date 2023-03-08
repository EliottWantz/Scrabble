import 'package:client_leger/controllers/friends_controller.dart';
import 'package:get/get.dart';

class FriendsBinding implements Bindings {
  @override
  void dependencies() {
    Get.lazyPut<FriendsController>(() => FriendsController());
  }
}