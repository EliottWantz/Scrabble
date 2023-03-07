import 'dart:io';

import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/models/requests/login_request.dart';
import 'package:client_leger/models/requests/logout_request.dart';
import 'package:client_leger/models/requests/register_request.dart';
import 'package:client_leger/models/response/login_response.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/storage_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:get/get.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

class AuthService extends GetxService {
  final StorageService storageService;
  final ApiRepository apiRepository;
  final WebsocketService websocketService;
  final UserService userService;

  AuthService(
      {required this.storageService,
      required this.apiRepository,
      required this.websocketService,
      required this.userService});

  Future<void> login(LoginRequest loginRequest) async {
    var res = await apiRepository.login(loginRequest);
    if (res == null) return;
    userService.user = res.user;
    await _setSession(res.token);
    websocketService.connect();
  }

  Future<void> register(RegisterRequest registerRequest, File imagePath) async {
    var res = await apiRepository.signup(registerRequest, imagePath);
    if (res == null) return;
    userService.user = res.user;
    await _setSession(res.token);
    websocketService.connect();
  }

  Future<void> logout() async {
    // Get.delete<WebsocketService>();
    websocketService.socket.sink.close();
    // websocketService.messages.value = [];
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
