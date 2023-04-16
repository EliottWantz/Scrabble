import 'dart:async';
import 'dart:io';

import 'package:client_leger/models/avatar.dart';
import 'package:client_leger/models/requests/accept_friend_request.dart';
import 'package:client_leger/models/requests/accept_join_game_request.dart';
import 'package:client_leger/models/requests/game_invite_request.dart';
import 'package:client_leger/models/requests/login_request.dart';
import 'package:client_leger/models/requests/register_request.dart';
import 'package:client_leger/models/requests/update_username_request.dart';
import 'package:client_leger/models/requests/upload_avatar_request.dart';
import 'package:client_leger/models/response/login_response.dart';
import 'package:client_leger/models/response/register_response.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/services/storage_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:get/get.dart';

import '../models/requests/delete_friend_request.dart';
import '../models/requests/send_friend_request.dart';
import 'api_provider.dart';

class ApiRepository {
  ApiRepository({required this.apiProvider});

  final ApiProvider apiProvider;
  final UserService userService = Get.find();

  Future<LoginResponse?> login(LoginRequest data) async {
    final res = await apiProvider.login('/login', data);
    if (res.statusCode == 200) {
      return LoginResponse.fromJson(res.body);
    }
    return null;
  }

  Future<User?> user() async {
    final res = await apiProvider.user('/user/${userService.user.value!.id}');
    if (res.statusCode == 200) {
      return User.fromJson(res.body['user']);
    }
    return null;
  }

  Future<void> preferences() async {
    await apiProvider.preferences('/user/${userService.user.value!.id}/config',
        userService.user.value!.preferences.toJson());
    return;
  }

  Future<void> username(UpdateUsernameRequest data) async {
    final res =
        await apiProvider.username('/user/updateUsername', data.toJson());
    if (res.statusCode == 200) {
      final newUser = await user();
      if (newUser != null) {
        userService.user.value = newUser;
      }
    }
    return;
  }

  Future<RegisterResponse?> signup(RegisterRequest data,
      {File? imagePath}) async {
    FormData formData;
    if (imagePath != null) {
      formData = FormData({
        'avatar': MultipartFile(imagePath,
            filename: imagePath.path.split('/').last,
            contentType: 'multipart/form-data'),
        'username': data.username,
        'email': data.email,
        'password': data.password,
      });
    } else {
      formData = FormData({
        'avatarUrl': data.avatar!.url,
        'fileId': data.avatar!.fileId,
        'username': data.username,
        'email': data.email,
        'password': data.password,
      });
    }
    final res = await apiProvider.signup('/signup', formData);
    if (res.statusCode == 201) {
      return RegisterResponse.fromJson(res.body);
    }
    return null;
  }

  Future<List<Avatar>?> avatars() async {
    final res = await apiProvider.avatars('/avatar/defaults');
    if (res.statusCode == 200) {
      return List<Avatar>.from(
          (res.body['avatars'] as List).map((model) => Avatar.fromJson(model)));
    }
    return null;
  }

  Future<void> upload(UploadAvatarRequest data, {File? imagePath}) async {
    FormData formData;
    if (imagePath != null) {
      formData = FormData({
        'id': data.id,
        'avatarUrl': data.avatarUrl,
        'fileId': data.fileId,
        'avatar': MultipartFile(imagePath,
            filename: imagePath.path.split('/').last,
            contentType: 'multipart/form-data'),
      });
    } else {
      formData = FormData({
        'id': data.id,
        'avatarUrl': data.avatarUrl,
        'fileId': data.fileId,
      });
    }
    final res = await apiProvider.upload(
        '/user/avatar/${userService.user.value!.id}', formData);
    if (res.statusCode == 201) {
      final newUser = await user();
      if (newUser != null) {
        userService.user.value = newUser;
      }
    }
    return;
  }

  Future<void> sendFriendRequest(SendFriendRequest requestData) async {
    // final Map<String, String> headers = {
    //   "Authorization": "Bearer ${storageService.read("token")}"
    // };
    await apiProvider.sendFriendRequest(
      '/user/friends/request/${userService.user.value!.id}/${requestData.friendId}',
      // headers
    );
    // if (res.statusCode == 200) {
    //   return FriendRequestResponse.fromJson(res.body);
    // }
  }

  Future<bool?> acceptFriendRequest(AcceptFriendRequest requestData) async {
    final res = await apiProvider.acceptFriendRequest(
      '/user/friends/accept/${userService.user.value!.id}/${requestData.friendId}',
      // headers
    );
    if (res.statusCode == 200) {
      return true;
    }
    return null;
  }

  Future<bool?> deleteFriendRequest(DeleteFriendRequest requestData) async {
    final res = await apiProvider.deleteFriendRequest(
      '/user/friends/accept/${userService.user.value!.id}/${requestData.friendId}',
      // headers
    );
    if (res.statusCode == 200) {
      return true;
    }
    return null;
  }

  Future<bool?> deleteFriend(DeleteFriendRequest requestData) async {
    final res = await apiProvider.deleteFriend(
      '/user/friends/${userService.user.value!.id}/${requestData.friendId}',
      // headers
    );
    if (res.statusCode == 200) {
      return true;
    }
    return null;
  }

  Future<bool?> acceptJoinGameRequest(AcceptJoinGameRequest requestData) async {
    final res = await apiProvider.acceptJoinGameRequest(
      '/game/accept/${userService.user.value!.id}/${requestData.userId}/${requestData.gameId}',
      // headers
    );
    if (res.statusCode == 200) {
      return true;
    }
    return null;
  }

  Future<bool?> declineJoinGameRequest(AcceptJoinGameRequest requestData) async {
    final res = await apiProvider.declineJoinGameRequest(
      '/game/accept/${userService.user.value!.id}/${requestData.userId}/${requestData.gameId}',
      // headers
    );
    if (res.statusCode == 200) {
      return true;
    }
    return null;
  }

  Future<bool?> revokeJoinGameRequest(AcceptJoinGameRequest requestData) async {
    final res = await apiProvider.revokeJoinGameRequest(
      '/game/revoke/${userService.user.value!.id}/${requestData.gameId}',
      // headers
    );
    if (res.statusCode == 200) {
      return true;
    }
    return null;
  }

  Future<List<User>?> onlineFriends() async {
    final res = await apiProvider.onlineFriends('/user/friends/online/${userService.user.value!.id}');
    if (res.statusCode == 200) {
      return List<User>.from(
          (res.body['friends'] as List).map((user) => User.fromJson(user)));
    }
    return null;
  }

  Future<bool?> gameInvite(GameInviteRequest data) async {
    final res = await apiProvider.gameInvite('/user/friends/game/invite', data);
    if (res.statusCode == 200) {
      return true;
    }
    return null;
  }

  Future<bool?> acceptGameInvite(GameInviteRequest data) async {
    final res = await apiProvider.acceptGameInvite('/user/friends/game/accept-invite', data);
    if (res.statusCode == 200) {
      return true;
    }
    return null;
  }
}
