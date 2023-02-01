import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/models/requests/login_request.dart';
import 'package:client_leger/models/requests/register_request.dart';
import 'package:client_leger/services/storage_service.dart';
import 'package:get/get.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

class AuthService extends GetxService {
  final StorageService storageService;
  final ApiRepository apiRepository;

  AuthService({required this.storageService, required this.apiRepository});

  Future<void> login(LoginRequest loginRequest) async {
    var res = await apiRepository.login(loginRequest);
    await _setSession(res!.token);
  }

  Future<void> register(RegisterRequest registerRequest) async {
    var res = await apiRepository.register(registerRequest);
    await _setSession(res!.token);
  }

  Future<void> logout() async {
    await storageService.remove('jwt_token');
  }

  Future<void> _setSession(String token) async {
    await storageService.write('jwt_token', token);
  }

  bool isUserLoggedIn() {
    final token = storageService.read('jwt_token');
    return JwtDecoder.isExpired(token) == false;
  }
}
