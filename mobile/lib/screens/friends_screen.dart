import 'package:client_leger/controllers/friends_controller.dart';
import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';

class FriendsScreen extends GetView<FriendsController> {
  const FriendsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
        minimum: const EdgeInsets.symmetric(horizontal: 40.0),
        child: Center(
          child: SizedBox(
            width: 300,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Text('Friends List', style: TextStyle(fontSize: 30),)
              ],
            ),
          )
        )
    );
  }
}
