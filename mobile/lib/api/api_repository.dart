import 'dart:async';
import 'dart:io';

import 'package:client_leger/models/requests/login_request.dart';
import 'package:client_leger/models/requests/logout_request.dart';
import 'package:client_leger/models/requests/register_request.dart';
import 'package:client_leger/models/response/avatar_upload_response.dart';
import 'package:client_leger/models/response/login_response.dart';
import 'package:client_leger/models/response/logout_response.dart';
import 'package:client_leger/models/response/register_response.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:get/get.dart';
import 'package:get/get_connect.dart';

import 'api_provider.dart';

class ApiRepository {
  ApiRepository({required this.apiProvider});

  final ApiProvider apiProvider;
  final UserService userService = Get.find();

  Future<LoginResponse?> login(LoginRequest data) async {
    final res = await apiProvider.login('/login', data);
    if (res.statusCode == 201) {
      return LoginResponse.fromJson(res.body);
    }
    return null;
  }

  Future<RegisterResponse?> signup(RegisterRequest data) async {
    final res = await apiProvider.signup('/signup', data);
    if (res.statusCode == 201) {
      return RegisterResponse.fromJson(res.body);
    }
    return null;
  }

  // Future<LogoutResponse?> logout(LogoutRequest data) async {
  //   await apiProvider.logout('/logout', data);
  // }

  Future<AvatarUploadResponse?> upload(File imagePath) async {
    final userId = userService.user.id;
    final FormData formData = FormData({
      'avatar': MultipartFile(imagePath,
          filename: imagePath.path.split('/').last,
          contentType: 'multipart/form-data'),
    });
    final res = await apiProvider.upload('/avatar/$userId', formData);
    if (res.statusCode == 201) {
      return AvatarUploadResponse.fromJson(res.body);
    }
    return null;
  }
}
