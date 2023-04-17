import 'dart:convert';

class Avatar {
  Avatar({required this.url, required this.fileId});

  String url;
  String fileId;

  factory Avatar.fromRawJson(String str) => Avatar.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Avatar.fromJson(Map<String, dynamic> json) => Avatar(
        url: json["url"],
        fileId: json["fileId"],
      );

  Map<String, dynamic> toJson() => {
        "url": url,
        "fileId": fileId,
      };
}
