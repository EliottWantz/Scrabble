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
    if (res.token != null && res.user != null) {
      userService.user = res.user as User;
      await _setSession(res.token as String);
      websocketService.connect();
    }
  }

  Future<void> register(RegisterRequest registerRequest) async {
    var res = await apiRepository.signup(registerRequest);
    if (res == null) return;
    if (res.token != null && res.user != null) {
      userService.user = res.user as User;
      await _setSession(res.token as String);
      websocketService.connect();
    }
  }

  Future<void> logout() async {
    // final String username = storageService.read('username');
    // final String id = storageService.read('id');
    // await storageService.remove('username');
    // await storageService.remove('id');
    // final logoutRequest = LogoutRequest(id: id, username: username);
    // await apiRepository.logout(logoutRequest);
    // Get.delete<WebsocketService>();
    // websocketService.socket.
    websocketService.messages.value = [];
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
