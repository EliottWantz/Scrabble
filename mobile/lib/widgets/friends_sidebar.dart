import 'package:client_leger/widgets/custom_button.dart';
import 'package:client_leger/widgets/input_field.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:sidebarx/sidebarx.dart';
import 'package:client_leger/utils/sidebar_theme.dart';


class FriendsSideBar extends StatelessWidget {
  const FriendsSideBar({
    Key? key,
    required SidebarXController controller,
  }) : _controller = controller,
        super(key: key);

  final SidebarXController _controller;

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
      label: 'Friends'
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
    return [
      const SidebarXItem(
        icon: Icons.people_alt,
        label: 'Friends',
      ),
      const SidebarXItem(
        icon: Icons.home,
        label: 'Friend 1',
      ),
      const SidebarXItem(
        icon: Icons.home,
        label: 'Friend 2',
      ),
      const SidebarXItem(
        icon: Icons.home,
        label: 'Friend 3',
      ),
    ];
  }
}
