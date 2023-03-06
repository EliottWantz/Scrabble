import 'package:flutter/material.dart';
import 'package:sidebarx/sidebarx.dart';

const primaryColor = Color(0xFF685BFF);
const canvasColor = Color(0xFF2E2E48);
const friendsCanvasColor = Color(0xFF333349);
const scaffoldBackgroundColor = Color(0xFF464667);
const accentCanvasColor = Color(0xFF3E3E61);
const white = Colors.white;
final actionColor = const Color(0xFF5F5FA7).withOpacity(0.6);
final divider = Divider(color: white.withOpacity(0.3), height: 1);

class sideBarUtils {
  static final sideBarTheme = SidebarXTheme(
    margin: const EdgeInsets.all(10),
    decoration: BoxDecoration(
      color: canvasColor,
      borderRadius: BorderRadius.circular(20),
    ),
    hoverColor: scaffoldBackgroundColor,
    textStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
    selectedTextStyle: const TextStyle(color: Colors.white),
    itemTextPadding: const EdgeInsets.only(left: 30),
    selectedItemTextPadding: const EdgeInsets.only(left: 30),
    itemDecoration: BoxDecoration(
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: canvasColor),
    ),
    selectedItemDecoration: BoxDecoration(
      borderRadius: BorderRadius.circular(10),
      border: Border.all(
        color: actionColor.withOpacity(0.37),
      ),
      gradient: const LinearGradient(
        colors: [accentCanvasColor, canvasColor],
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.28),
          blurRadius: 30,
        )
      ],
    ),
    iconTheme: IconThemeData(
      color: Colors.white.withOpacity(0.7),
      size: 20,
    ),
    selectedIconTheme: const IconThemeData(
      color: Colors.white,
      size: 20,
    ),
  );

  static const sideBarThemeExt = SidebarXTheme(
    width: 200,
    decoration: BoxDecoration(
      color: canvasColor,
    ),
  );

  static const friendsSideBarThemeExt = SidebarXTheme(
    width: 150,
    decoration: BoxDecoration(
      color: friendsCanvasColor,
    )
  );
}
