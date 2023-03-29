import 'dart:async';
import 'dart:io';

import 'package:client_leger/models/avatar.dart';
import 'package:client_leger/models/requests/login_request.dart';
import 'package:client_leger/models/requests/register_request.dart';
import 'package:client_leger/models/response/login_response.dart';
import 'package:client_leger/models/response/register_response.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:get/get.dart';

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

  Future<Avatar?> upload(File imagePath) async {
    final userId = userService.user.value!.id;
    final FormData formData = FormData({
      'avatar': MultipartFile(imagePath,
          filename: imagePath.path.split('/').last,
          contentType: 'multipart/form-data'),
    });
    final res = await apiProvider.upload('/avatar/$userId', formData);
    if (res.statusCode == 201) {
      return Avatar.fromJson(res.body);
    }
    return null;
  }

// Future<FriendRequestResponse?> sendFriendRequest(FriendRequest data) async {
//   final res = await apiProvider.login('/user/friends/request ', data);
//   if (res.statusCode == 200) {
//     return FriendRequest.fromJson(res.body);
//   }
//   return null;
// }
}
