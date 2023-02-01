import 'dart:convert';

class RegisterResponse {
  RegisterResponse({
    required this.token,required this.error
  });

  String token;
  String error;

  factory RegisterResponse.fromRawJson(String str) =>
      RegisterResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory RegisterResponse.fromJson(Map<String, dynamic> json) =>
      RegisterResponse(
        token: json["token"],
        error: json["error"],
      );

  Map<String, dynamic> toJson() => {
    "token": token,
    "error": error,
  };
}