import 'dart:convert';

class UserPrefs {
  String? theme;

  UserPrefs({this.theme});

  factory UserPrefs.fromJson(Map<String, dynamic> json) => UserPrefs(
        theme: json["theme"],
      );

  Map<String, dynamic> toJson() => {
        "theme": theme,
      };
}

class User {
  String id;
  String username;

  User({required this.id, required this.username});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json["id"],
      username: json["username"],
    );
  }

  Map<String, dynamic> toJson() => {
        "id": id,
        "username": username,
      };
}
