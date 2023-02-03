import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/models/requests/login_request.dart';
import 'package:client_leger/models/requests/register_request.dart';
import 'package:client_leger/models/response/login_response.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/storage_service.dart';
import 'package:get/get.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

class AuthService extends GetxService {
  final StorageService storageService;
  final ApiRepository apiRepository;

  AuthService({required this.storageService, required this.apiRepository});

  Future<void> login(LoginRequest loginRequest) async {
    var res = await apiRepository.login(loginRequest);
    if (res == null) return;
    if (res.token != null) await _setSession(res.token as String);
  }

  Future<void> register(RegisterRequest registerRequest) async {
    var res = await apiRepository.signup(registerRequest);
    if (res == null) return;
    if (res.token != null) await _setSession(res.token as String);
  }

  Future<void> logout() async {
    await storageService.remove('jwt_token');
    Get.offAllNamed(Routes.AUTH);
  }

  Future<void> _setSession(String token) async {
    await storageService.write('jwt_token', token);
  }

  bool isUserLoggedIn() {
    final token = storageService.read('jwt_token');
    try {
      return JwtDecoder.isExpired(token) == false;
    } catch (e) {
      return false;
    }
  }
}
