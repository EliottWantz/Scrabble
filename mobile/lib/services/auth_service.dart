import 'dart:io';

import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/app_theme.dart';
import 'package:client_leger/models/requests/login_request.dart';
import 'package:client_leger/models/requests/logout_request.dart';
import 'package:client_leger/models/requests/register_request.dart';
import 'package:client_leger/models/response/login_response.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/avatar_service.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/services/storage_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

class AuthService extends GetxService {
  final StorageService storageService;
  final ApiRepository apiRepository;
  final WebsocketService websocketService;
  final UserService userService;
  final AvatarService avatarService;
  final SettingsService settingsService = Get.find();

  AuthService(
      {required this.storageService,
      required this.apiRepository,
      required this.websocketService,
      required this.userService,
      required this.avatarService});

  Future<void> login(LoginRequest loginRequest) async {
    var res = await apiRepository.login(loginRequest);
    if (res == null) return;
    userService.user.value = res.user;
    userService.friends.addAll(res.user.friends);
    Get.changeTheme(res.user.preferences.theme == 'light'
        ? ThemeConfig.lightTheme
        : ThemeConfig.darkTheme);
    settingsService.currentThemeIcon.value =
        Get.isDarkMode ? Icons.wb_sunny : Icons.brightness_2;
    settingsService.currentLangValue.value = res.user.preferences.language;
    Locale changedLocale = res.user.preferences.language == 'fr'
        ? const Locale('fr', 'FR')
        : const Locale('en', 'US');
    await Get.updateLocale(changedLocale);
    await _setSession(res.token);
    websocketService.connect();
  }

  Future<void> register(RegisterRequest registerRequest,
      {File? imagePath}) async {
    var res = await apiRepository.signup(registerRequest, imagePath: imagePath);
    if (res == null) return;
    userService.user.value = res.user;
    userService.friends.addAll(res.user.friends);
    await _setSession(res.token);
    websocketService.connect();
  }

  Future<void> logout() async {
    // Get.delete<WebsocketService>();
    websocketService.socket.sink.close();
    // websocketService.messages.value = [];
    userService.friends.value.clear();
    await storageService.remove('token');
    Get.offAllNamed(Routes.AUTH);
  }

  Future<void> _setSession(String token) async {
    await storageService.write('token', token);
  }

  bool isUserLoggedIn() {
    final token = storageService.read('token');
    try {
      return JwtDecoder.isExpired(token) == false;
    } catch (e) {
      return false;
    }
  }
}
