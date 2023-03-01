import 'dart:async';
import 'dart:io';

import 'package:client_leger/models/requests/login_request.dart';
import 'package:client_leger/models/requests/logout_request.dart';
import 'package:client_leger/models/requests/register_request.dart';
import 'package:client_leger/models/response/login_response.dart';
import 'package:client_leger/models/response/logout_response.dart';
import 'package:client_leger/models/response/register_response.dart';
import 'package:get/get_connect.dart';

import 'api_provider.dart';

class ApiRepository {
  ApiRepository({required this.apiProvider});

  final ApiProvider apiProvider;

  Future<LoginResponse?> login(LoginRequest data) async {
    final res = await apiProvider.login('/login', data);
    if (res.statusCode == 201) {
      return LoginResponse.fromJson(res.body);
    }
  }

  Future<RegisterResponse?> signup(RegisterRequest data) async {
    final res = await apiProvider.signup('/signup', data);
    if (res.statusCode == 201) {
      return RegisterResponse.fromJson(res.body);
    }
  }

  // Future<LogoutResponse?> logout(LogoutRequest data) async {
  //   await apiProvider.logout('/logout', data);
  // }

  Future<void> upload (File imagePath) async {
    final FormData formData = FormData({
      'file1': MultipartFile(imagePath, filename: imagePath.path.split('/').last),
    });
    final res = await apiProvider.upload('path', formData);
  }
}
