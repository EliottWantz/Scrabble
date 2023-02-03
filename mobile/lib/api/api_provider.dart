import 'package:client_leger/models/requests/login_request.dart';
import 'package:client_leger/models/requests/register_request.dart';
import 'package:get/get.dart';
import 'base_provider.dart';


class ApiProvider extends BaseProvider {
  Future<Response> login(String path, LoginRequest data) {
    return post(path, data.toJson());
  }

  Future<Response> signup(String path, RegisterRequest data) {
    return post(path, data.toJson());
  }

  // Future<Response> logout(String path, RegisterRequest data) {
  //   return post(path, data.toJson());
  // }
}