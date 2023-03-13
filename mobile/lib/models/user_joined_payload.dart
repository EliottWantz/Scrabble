import 'package:client_leger/models/user.dart';

class UserJoinedPayload {
  String roomId;
  User user;

  UserJoinedPayload({required this.roomId, required this.user});

  factory UserJoinedPayload.fromJson(Map<dynamic, dynamic> json) => UserJoinedPayload(
      roomId: json["roomId"],
      user: User.fromJson(json["user"])
  );

  Map<String, dynamic> toJson() => {
    "roomId": roomId,
    "user": user
  };
}