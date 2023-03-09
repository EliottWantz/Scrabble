import 'avatar.dart';

class PublicUser {
  String id;
  String username;
  Avatar avatar;

  PublicUser({
    required this.id,
    required this.username,
    required this.avatar});

  factory PublicUser.fromJson(Map<String, dynamic> json) {
    return PublicUser(
        id: json["id"],
        username: json["username"],
        avatar: Avatar.fromJson(json["avatar"]));
  }

  Map<String, dynamic> toJson() => {
    "id": id,
    "username": username,
    "avatar": avatar.toJson(),
  };
}