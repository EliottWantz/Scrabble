import 'package:client_leger/models/user.dart';

class NewUserPayload {
  User user;

  NewUserPayload({
    required this.user
  });

  factory NewUserPayload.fromJson(Map<String, dynamic> json) {
    return NewUserPayload(
        user: User.fromJson(json["user"])
    );
  }

  Map<String, dynamic> toJson() => {
    "user": user
  };
}