import 'package:client_leger/models/user.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:get/get.dart';

import '../api/api_repository.dart';
import '../models/requests/send_friend_request.dart';

class UsersService extends GetxService {
  final users = <User>[].obs;

  final ApiRepository apiRepository = Get.find();
  final UserService userService = Get.find();

  Future<void> sendFriendRequest(String friendId) async {
    final request = SendFriendRequest(
      friendId: friendId
    );
    await apiRepository.sendFriendRequest(request);
    // if (res == null) return;
  }
}