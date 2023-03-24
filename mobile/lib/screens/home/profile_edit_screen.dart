import 'package:client_leger/widgets/app_sidebar.dart';
import 'package:flutter/material.dart';
import 'package:sidebarx/sidebarx.dart';

class ProfieEditScreen extends StatelessWidget {
  ProfieEditScreen({Key? key}) : super(key: key);
  final sideBarController =
      SidebarXController(selectedIndex: 0, extended: true);

  @override
  Widget build(BuildContext context) {
    return Builder(
        builder: (BuildContext context) => Scaffold(
              body: Row(
                children: [
                  AppSideBar(controller: sideBarController),
                  Expanded(
                    child: _buildItems(
                      context,
                    ),
                  ),
                ],
              ),
            ));
  }

  Widget _buildItems(BuildContext context) {
    return AnimatedBuilder(
        animation: sideBarController,
        builder: (context, child) {
          return SingleChildScrollView(
            child: Center(
              child: SizedBox(
                  height: 600,
                  width: 600,
                  child: Column(
                    children: [
                      const Image(
                        image: AssetImage('assets/images/scrabble.png'),
                      ),
                    ],
                  )),
            ),
          );
        });
  }
}
