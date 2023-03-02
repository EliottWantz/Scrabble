import 'dart:convert';

class AvatarUploadResponse {
  AvatarUploadResponse({required this.url, required this.fileId});

  String url;
  String fileId;

  factory AvatarUploadResponse.fromRawJson(String str) =>
      AvatarUploadResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory AvatarUploadResponse.fromJson(Map<String, dynamic> json) =>
      AvatarUploadResponse(
        url: json["url"],
        fileId: json["fileId"],
      );

  Map<String, dynamic> toJson() => {
        "url": url,
        "fileId": fileId,
      };
}
