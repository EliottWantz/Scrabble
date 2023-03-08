import 'package:client_leger/controllers/chatbox_controller.dart';
import 'package:client_leger/controllers/friends_controller.dart';
import 'package:client_leger/screens/profile_screen.dart';
import 'package:client_leger/widgets/chatbox.dart';
import 'package:client_leger/widgets/friends_sidebar.dart';
import 'package:client_leger/screens/friends_screen.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:sidebarx/sidebarx.dart';

class SocialScreen extends GetView<FriendsController> {
  SocialScreen({Key? key}) : super(key: key);

  final _key = GlobalKey<ScaffoldState>();
  // final FocusNode messageInputFocusNode = FocusNode();
  final friendSidebarController = SidebarXController(selectedIndex: 0, extended: true);

  @override
  Widget build(BuildContext context) {
    return Builder(
        builder: (BuildContext context) => Scaffold(
          key: _key,
          body: Row(
            children: [
              Expanded(child: Center(
                  child: _buildItems(
                  context,
                ),
              )),
              FriendsSideBar(
                  items: controller.userService.user.joinedChatRooms,
                  controller: friendSidebarController
              ),
            ],
          ),
        )
    );
  }

  Widget _buildItems(BuildContext context) {
    return AnimatedBuilder(
        animation: friendSidebarController,
        builder: (context, child) {
          switch (friendSidebarController.selectedIndex) {
            case 0:
              return const FriendsScreen();
            default:
              return const ProfileScreen();
          }
        }
    );
  }
}
