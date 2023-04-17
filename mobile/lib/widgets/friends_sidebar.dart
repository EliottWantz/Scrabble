import 'package:client_leger/controllers/friends_sidebar_controller.dart';
import 'package:client_leger/models/room.dart';
import 'package:client_leger/widgets/custom_button.dart';
import 'package:client_leger/widgets/input_field.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:sidebarx/sidebarx.dart';
import 'package:client_leger/utils/sidebar_theme.dart';


class FriendsSideBar extends GetView<FriendsSideBarController> {
  FriendsSideBar({
    Key? key,
    required SidebarXController controller,
    required List<Room> items,
  }) : _items = items,
        _controller = controller,
        super(key: key);

  final SidebarXController _controller;
  final List<Room> _items; //= [
  //   'Friend1',
  //   'Friend2',
  //   'Friend3',
  //   'Friend4'
  // ];

  @override
  Widget build(BuildContext context) {
    return SidebarX(
      theme: sideBarUtils.sideBarTheme,
      extendedTheme: sideBarUtils.friendsSideBarThemeExt,
      showToggleButton: false,
      controller: _controller,
      // headerBuilder: (context, extended) {
      //   return _buildHeader() as Widget;
      // },
      // headerDivider: const Divider(
      //   color: Color(0xFF2E2E48),
      // ),
      items: _buildListItems(context),
    );
  }

  SidebarXItem _buildHeader() {
    return SidebarXItem(
      label: 'Friends',
    );
  }

  // Widget _buildHeader() {
  //   return SizedBox(
  //     height: 150,
  //     child: Padding(
  //       padding: const EdgeInsets.all(16.0),
  //       child: Center(
  //         child: CustomButton(
  //           text: 'Friends',
  //           textColor: Colors.white,
  //           onPressed: () {
  //             print('clicked on friends button');
  //           },
  //         ),
  //       ),
  //     ),
  //   );
  // }

  List<SidebarXItem> _buildListItems(BuildContext context) {
    List<SidebarXItem> items = [
        const SidebarXItem(
          icon: Icons.people_alt,
          label: 'Friends',
        ),
        const SidebarXItem(
          icon: Icons.add,
          label: 'Create',
        ),
        const SidebarXItem(
          icon: Icons.search,
          label: 'Explore',
        )
    ];
    for (int i = 0; i < this._items.length; i++) {
      SidebarXItem item = SidebarXItem(
          icon: Icons.people_alt,
          label: this._items[i].roomName.split('/').length > 1
                    ? this._items[i].roomName.split('/')[1]
                    : this._items[i].roomName,
          onTap: () {
            controller.roomService.updateCurrentRoomId(this._items[i].roomId);
            controller.roomService.updateCurrentRoomMessages();
          }
      );
      items.add(item);
    }
    return items;
    // return [
    //   const SidebarXItem(
    //     icon: Icons.people_alt,
    //     label: 'Friends',
    //   ),
    //   const SidebarXItem(
    //     icon: Icons.home,
    //     label: 'Friend 1',
    //   ),
    //   const SidebarXItem(
    //     icon: Icons.home,
    //     label: 'Friend 2',
    //   ),
    //   const SidebarXItem(
    //     icon: Icons.home,
    //     label: 'Friend 3',
    //   ),
    // ];
  }
}
