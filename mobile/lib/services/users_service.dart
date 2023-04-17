import 'package:client_leger/models/requests/accept_friend_request.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';

import '../api/api_repository.dart';
import '../models/requests/delete_friend_request.dart';
import '../models/requests/send_friend_request.dart';

class UsersService extends GetxService {
  final users = <User>[].obs;
  final onlineUsers = <User>[].obs;

  final ApiRepository apiRepository = Get.find();
  final UserService userService = Get.find();

  User? getUserById(String userId) {
    for (User user in users) {
      if (user.id == userId) {
        return user;
      }
    }
    return null;
  }

  User? getUserByUsername(String username) {
    for (User user in users) {
      if (user.username == username) {
        return user;
      }
    }
    return null;
  }

  String getUserId(String username) {
    for (User user in users) {
      if (user.username == username) {
        return user.id;
      }
    }
    return '';
  }

  String getUserUsername(String userId) {
    for (User user in users) {
      if (user.id == userId) {
        return user.username;
      }
    }
    return '';
  }

  List<String> getOnlineFriendIds() {
    List<String> onlineFriendIds = [];
    List<String> onlineUserIds = getOnlineUserIds();
    for (final friendId in userService.friends.value) {
      if (onlineUserIds.contains(friendId)) {
        onlineFriendIds.add(friendId);
      }
    }
    return onlineFriendIds;
  }

  List<String> getOfflineFriendIds() {
    List<String> offlineFriendIds = [];
    List<String> onlineUserIds = getOnlineUserIds();
    for (final friendId in userService.friends.value) {
      if (!onlineUserIds.contains(friendId)) {
        offlineFriendIds.add(friendId);
      }
    }
    return offlineFriendIds;
  }

  List<String> getOnlineFriendUsernames() {
    List<String> onlineFriendUsernames = [];
    List<String> onlineUserUsernames = getOnlineUserUsernames();
    for (final friendUsername in userService.friends.value) {
      if (onlineUserUsernames.contains(friendUsername)) {
        onlineFriendUsernames.add(friendUsername);
      }
    }
    return onlineFriendUsernames;
  }

  List<String> getOfflineFriendUsernames() {
    List<String> onlineFriendUsernames = [];
    List<String> onlineUserUsernames = getOnlineUserUsernames();
    for (final friendUsername in userService.friends.value) {
      if (!onlineUserUsernames.contains(friendUsername)) {
        onlineFriendUsernames.add(friendUsername);
      }
    }
    return onlineFriendUsernames;
  }

  List<String> getOnlineUserUsernames() {
    List<String> onlineUserUsernames = [];
    for (User user in onlineUsers.value) {
      onlineUserUsernames.add(user.username);
    }
    return onlineUserUsernames;
  }

  List<String> getOnlineUserIds() {
    List<String> onlineUserIds = [];
    for (User user in onlineUsers.value) {
      onlineUserIds.add(user.id);
    }
    return onlineUserIds;
  }

  bool isOnline(String username) {
    for (User user in onlineUsers) {
      if (user.username == username) {
        return true;
      }
    }
    return false;
  }

  List<String> getUserIdsFromUserList(List<User> users) {
    List<String> userIds = [];
    for (User user in users) {
      userIds.add(user.id);
    }
    return userIds;
  }

  List<String> getUsernamesFromUserIds(List<dynamic> userIds) {
    List<String> usernames = [];
    for (dynamic userId in userIds) {
      for (User user in users) {
        if (user.id == userId) {
          usernames.add(user.username);
        }
      }
    }
    return usernames;
  }

  Future<void> sendFriendRequest(String friendUsername) async {
    String friendId = getUserId(friendUsername);
    final request = SendFriendRequest(friendId: friendId);
    await apiRepository.sendFriendRequest(request);
    // if (res == null) return;
  }

  Future<bool?> acceptFriendRequest(String friendUsername) async {
    String friendId = getUserId(friendUsername);
    final request = AcceptFriendRequest(friendId: friendId);
    final res = await apiRepository.acceptFriendRequest(request);
    if (res == true) {
      return true;
    }
    return null;
  }

  Future<bool?> deleteFriendRequest(String friendUsername) async {
    String friendId = getUserId(friendUsername);
    final request = DeleteFriendRequest(friendId: friendId);
    final res = await apiRepository.deleteFriendRequest(request);
    if (res == true) {
      return true;
    }
    return null;
  }

  Future<bool?> deleteFriend(String friendUsername) async {
    String friendId = getUserId(friendUsername);
    final request = DeleteFriendRequest(friendId: friendId);
    final res = await apiRepository.deleteFriend(request);
    if (res == true) {
      return true;
    }
    return null;
  }
}
