import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/models/requests/login_request.dart';
import 'package:client_leger/models/requests/logout_request.dart';
import 'package:client_leger/models/requests/register_request.dart';
import 'package:client_leger/models/response/login_response.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/storage_service.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:get/get.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

class AuthService extends GetxService {
  final StorageService storageService;
  final ApiRepository apiRepository;
  final WebsocketService websocketService;

  AuthService(
      {required this.storageService,
      required this.apiRepository,
      required this.websocketService});

  Future<void> login(LoginRequest loginRequest) async {
    var res = await apiRepository.login(loginRequest);
    if (res == null) return;
    if (res.user != null) {
      await _setSession(res.user!);
      websocketService.connect(res.user!.id);
    }
  }

  // Future<void> register(RegisterRequest registerRequest) async {
  //   var res = await apiRepository.signup(registerRequest);
  //   if (res == null) return;
  //   if (res.token != null) await _setSession(res.token as String);
  // }

  Future<void> logout() async {
    final String username = storageService.read('username');
    final String id = storageService.read('id');
    await storageService.remove('username');
    await storageService.remove('id');
    final logoutRequest = LogoutRequest(id: id, username: username);
    await apiRepository.logout(logoutRequest);
    Get.offAllNamed(Routes.AUTH);
  }

  Future<void> _setSession(User user) async {
    await storageService.write('username', user.username);
    await storageService.write('id', user.id);
  }

  bool isUserLoggedIn() {
    final id = storageService.read('id');
    return id != null;
    // try {
    //   return JwtDecoder.isExpired(token) == false;
    // } catch (e) {
    //   return false;
    // }
  }
}
