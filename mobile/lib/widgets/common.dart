import 'package:flutter/material.dart';
import 'package:get/get.dart';

class CommonWidget {
  static AppBar generalAppBar(Rx<IconData> themeIcon,
      {void Function()? callback,String? title}) {
    return AppBar(
      elevation: 0.0,
      actions: [
        IconButton(
            onPressed: () {
              if (callback != null) {
                callback();
              }
            },
            icon: Obx(() =>Icon(themeIcon.value)))
      ],
      centerTitle: true,
      title: title != null ? Text(title) : null,
    );
  }
}