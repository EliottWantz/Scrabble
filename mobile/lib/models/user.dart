import 'dart:convert';

import 'package:client_leger/models/avatar.dart';

class Preferences {
  String theme;

  Preferences({required this.theme});

  factory Preferences.fromJson(Map<String, dynamic> json) => Preferences(
        theme: json["theme"],
      );

  Map<String, dynamic> toJson() => {
        "theme": theme,
      };
}

class User {
  String id;
  String username;
  String email;
  Avatar avatar;
  Preferences preferences;
  List<dynamic> joinedChatRooms;
  List<dynamic> friends;

  User(
      {required this.id,
      required this.username,
      required this.email,
      required this.avatar,
      required this.preferences,
      required this.joinedChatRooms,
      required this.friends});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
        id: json["id"],
        username: json["username"],
        email: json["email"],
        avatar: Avatar.fromJson(json["avatar"]),
        preferences: Preferences.fromJson(json["preferences"]),
        joinedChatRooms: json["joinedChatRooms"],
        friends: json["friends"]);
  }

  Map<String, dynamic> toJson() => {
        "id": id,
        "username": username,
        "email": email,
        "avatar": avatar.toJson(),
        "preferences": preferences.toJson(),
        "joinedChatRooms": joinedChatRooms,
        "friends": friends
      };
}
