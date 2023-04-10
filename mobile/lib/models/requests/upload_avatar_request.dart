import 'dart:convert';

class UploadAvatarRequest {
  UploadAvatarRequest(
      {required this.avatarUrl, required this.id, required this.fileId});

  String avatarUrl;
  String id;
  String fileId;

  factory UploadAvatarRequest.fromRawJson(String str) =>
      UploadAvatarRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory UploadAvatarRequest.fromJson(Map<String, dynamic> json) =>
      UploadAvatarRequest(
          fileId: json["fileId"], id: json["id"], avatarUrl: json["avatarUrl"]);

  Map<String, dynamic> toJson() =>
      {"fileId": fileId, "id": id, "avatarUrl": avatarUrl};
}
