import 'package:client_leger/models/requests/accept_friend_request.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:get/get.dart';

import '../api/api_repository.dart';
import '../models/requests/delete_friend_request.dart';
import '../models/requests/send_friend_request.dart';

class UsersService extends GetxService {
  final users = <User>[].obs;

  final ApiRepository apiRepository = Get.find();
  final UserService userService = Get.find();

  String getUserId(String username) {
    for (User user in users) {
      if (user.username == username) {
        return user.id;
      }
    }
    return '';
  }

  Future<void> sendFriendRequest(String friendUsername) async {
    String friendId = getUserId(friendUsername);
    final request = SendFriendRequest(
      friendId: friendId
    );
    await apiRepository.sendFriendRequest(request);
    // if (res == null) return;
  }

  Future<bool?> acceptFriendRequest(String friendUsername) async {
    String friendId = getUserId(friendUsername);
    final request = AcceptFriendRequest(
        friendId: friendId
    );
    final res = await apiRepository.acceptFriendRequest(request);
    if (res == true) {
      return true;
    }
    return null;
  }

  Future<bool?> deleteFriendRequest(String friendUsername) async {
    String friendId = getUserId(friendUsername);
    final request = DeleteFriendRequest(
        friendId: friendId
    );
    final res = await apiRepository.deleteFriendRequest(request);
    if (res == true) {
      return true;
    }
    return null;
  }

  Future<bool?> deleteFriend(String friendUsername) async {
    String friendId = getUserId(friendUsername);
    final request = DeleteFriendRequest(
        friendId: friendId
    );
    final res = await apiRepository.deleteFriend(request);
    if (res == true) {
      return true;
    }
    return null;
  }
}