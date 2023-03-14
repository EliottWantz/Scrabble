import 'package:client_leger/models/avatar.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';

class ProfileScreen extends StatelessWidget {
  ProfileScreen({Key? key}) : super(key: key);

  final UserService userService = Get.find();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      minimum: const EdgeInsets.symmetric(horizontal: 40.0),
      child: Center(
        child: SizedBox(
          width: 300,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('${userService.user.value!.username}', style: TextStyle(fontSize: 30),),
              Text('${userService.user.value!.email}', style: TextStyle(fontSize: 30),),
              CircleAvatar(
                backgroundColor: Colors.transparent,
                maxRadius: 40,
                backgroundImage:
                NetworkImage(userService.user.value!.avatar.url),
              )
            ],
          ),
        ),
      ),
    );
  }
}
