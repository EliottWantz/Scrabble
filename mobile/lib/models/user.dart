import 'dart:convert';

import 'package:client_leger/models/avatar.dart';

class Preferences {
  String theme;
  String language;

  Preferences({required this.theme, required this.language});

  factory Preferences.fromJson(Map<String, dynamic> json) =>
      Preferences(theme: json["theme"], language: json["language"]);

  Map<String, dynamic> toJson() => {"theme": theme, "language": language};
}

class User {
  String id;
  String username;
  String email;
  Avatar avatar;
  Preferences preferences;

  User(
      {required this.id,
      required this.username,
      required this.email,
      required this.avatar,
      required this.preferences});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
        id: json["id"],
        username: json["username"],
        email: json["email"],
        avatar: Avatar.fromJson(json["avatar"]),
        preferences: Preferences.fromJson(json["preferences"]));
  }

  Map<String, dynamic> toJson() => {
        "id": id,
        "username": username,
        "email": email,
        "avatar": avatar.toJson(),
        "preferences": preferences.toJson(),
      };
}
