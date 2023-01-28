import 'package:client_leger/routes/app_routes.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Login',
        ),
      ),
      body: const SafeArea(
        minimum: EdgeInsets.all(40),
        child: Text(''),
      ),
    );
  }
}
