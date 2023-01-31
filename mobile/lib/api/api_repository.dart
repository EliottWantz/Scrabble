import 'dart:async';

import 'api_provider.dart';

import 'dart:convert';

class LoginResponse {
  LoginResponse({
    required this.token,
  });

  String token;

  factory LoginResponse.fromRawJson(String str) =>
      LoginResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory LoginResponse.fromJson(Map<String, dynamic> json) => LoginResponse(
    token: json["token"],
  );

  Map<String, dynamic> toJson() => {
    "token": token,
  };
}

class ApiRepository {
  ApiRepository({required this.apiProvider});

  final ApiProvider apiProvider;

  Future<LoginResponse?> login(LoginRequest data) async {
    final res = await apiProvider.login('/login', data);
    if (res.statusCode == 200) {
      return LoginResponse.fromJson(res.body);
    }
  }
  //
  // Future<RegisterResponse?> register(RegisterRequest data) async {
  //   final res = await apiProvider.register('/api/register', data);
  //   if (res.statusCode == 200) {
  //     return RegisterResponse.fromJson(res.body);
  //   }
  // }

}