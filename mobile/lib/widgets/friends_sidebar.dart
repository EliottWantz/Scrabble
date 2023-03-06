import 'package:client_leger/widgets/custom_button.dart';
import 'package:client_leger/widgets/input_field.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:sidebarx/sidebarx.dart';
import 'package:client_leger/utils/sidebar_theme.dart';


class FriendsSideBar extends StatelessWidget {
  const FriendsSideBar({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SidebarX(
      theme: sideBarUtils.sideBarTheme,
      extendedTheme: sideBarUtils.friendsSideBarThemeExt,
      showToggleButton: false,
      controller: SidebarXController(selectedIndex: 0, extended: true),
      headerBuilder: (context, extended) {
        return _buildHeader();
      },
      headerDivider: const Divider(
        color: Color(0xFF2E2E48),
      ),
      items: _buildListItems(context),
    );
  }

  List<SidebarXItem> _buildListItems(BuildContext context) {
    return [
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

  Widget _buildHeader() {
    return SizedBox(
      height: 150,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: CustomButton(
            text: 'Friends',
            onPressed: () {
              print('clicked on friends button');
            },
          ),
        ),
      ),
    );
  }
}
