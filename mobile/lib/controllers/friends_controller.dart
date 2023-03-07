import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';

class FriendsController extends GetxController {
  FriendsController();

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