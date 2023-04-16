import 'package:client_leger/controllers/chatbox_controller.dart';
import 'package:client_leger/controllers/friends_controller.dart';
import 'package:client_leger/widgets/search_bar.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class FriendsScreen extends GetView<FriendsController> {
  const FriendsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Obx(() =>
        Scaffold(
        body: Center(
                child: controller.widgetOptions.elementAt(controller.selectedIndex.value),
                // child: controller.widgetOptions.elementAt(0),
              ),
        bottomNavigationBar: BottomNavigationBar(
          items: const <BottomNavigationBarItem>[
            // BottomNavigationBarItem(
            //   icon: Icon(
            //       Icons.circle,
            //       color: Colors.green
            //   ),
            //   label: 'Online',
            // ),
            BottomNavigationBarItem(
              icon: Icon(
                  Icons.people_alt,
                  color: Colors.green
              ),
              label: 'All',
            ),
            BottomNavigationBarItem(
              icon: Icon(
                  Icons.check,
                  color: Colors.green
              ),
              label: 'Pending',
            ),
            BottomNavigationBarItem(
              icon: Icon(
                  Icons.add,
                  color: Colors.green
              ),
              label: 'Add Friend',
            ),
          ],
          currentIndex: controller.selectedIndex.value,
          selectedItemColor: Colors.amber[800],
          onTap: controller.onItemTapped,
        ),
      ));
  }
}