import 'package:flutter/cupertino.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:get/get.dart';

class FriendsController extends GetxController {
  FriendsController();

  final UserService userService = Get.find();

  final List<dynamic> items = [
    'Friend1',
    'Friend2',
    'Friend3',
    'Friend4'
  ];

  late RxInt selectedIndex = 0.obs;
  final List<Widget> widgetOptions = <Widget>[
    const Text(
      'Index 0: Home',
    ),
    const Text(
      'Index 1: Business',
    ),
    const Text(
      'Index 2: School',
    ),
  ];

  void onItemTapped(int index) {
    selectedIndex.value = index;
    print(selectedIndex.value);
  }
}