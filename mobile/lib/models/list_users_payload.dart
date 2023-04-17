import 'package:client_leger/models/game.dart';
import 'package:client_leger/models/room.dart';
import 'package:client_leger/models/user.dart';

import 'game_room.dart';

class ListUsersPayload {
  List<User> users;

  ListUsersPayload(
      {required this.users});

  factory ListUsersPayload.fromJson(Map<String, dynamic> json) {
    return ListUsersPayload(
        users: List<User>.from((json["users"] as List).map(
                (user) => User.fromJson(user))
        )
    );
  }

  Map<String, dynamic> toJson() => {
    "users": users
  };
}