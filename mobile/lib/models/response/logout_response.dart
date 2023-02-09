import 'dart:convert';

class LogoutResponse {
  LogoutResponse({this.error});

  String ?error;

  factory LogoutResponse.fromRawJson(String str) =>
      LogoutResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory LogoutResponse.fromJson(Map<String, dynamic> json) => LogoutResponse(
    error: json["error"],
  );

  Map<String, dynamic> toJson() => {
    "error": error,
  };
}
