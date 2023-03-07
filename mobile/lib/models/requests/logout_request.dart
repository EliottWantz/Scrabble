import 'dart:convert';

class LogoutRequest {
  LogoutRequest({
    required this.id,
  });

  String id;

  factory LogoutRequest.fromRawJson(String str) =>
      LogoutRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory LogoutRequest.fromJson(Map<String, dynamic> json) => LogoutRequest(
        id: json["id"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
      };
}
