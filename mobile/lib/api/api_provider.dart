import 'package:get/get.dart';
import 'base_provider.dart';

import 'dart:convert';

class LoginRequest {
  LoginRequest({
    required this.email,
    required this.password,
  });

  String email;
  String password;

  factory LoginRequest.fromRawJson(String str) =>
      LoginRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory LoginRequest.fromJson(Map<String, dynamic> json) => LoginRequest(
    email: json["email"],
    password: json["password"],
  );

  Map<String, dynamic> toJson() => {
    "email": email,
    "password": password,
  };
}

class ApiProvider extends BaseProvider {
  Future<Response> login(String path, LoginRequest data) {
    return post(path, data.toJson());
  }
  //
  // Future<Response> register(String path, RegisterRequest data) {
  //   return post(path, data.toJson());
  // }
  // Future<Response> getUsers(String path) {
  //   return get(path);
  // }
}