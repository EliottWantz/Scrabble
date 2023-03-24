import 'package:client_leger/models/user.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:get/get.dart';

import '../api/api_repository.dart';

class UsersService extends GetxService {
  final users = <User>[].obs;

  final ApiRepository apiRepository = Get.find();
  final UserService userService = Get.find();

  // Future<void> sendFriendRequest(String friendId) {
  //   var res = await apiRepository.sendFriendRequest(friendRequest);
  //   if (res == null) return;
  //   userService.user.value!.friends.add(res.)
  // }
}