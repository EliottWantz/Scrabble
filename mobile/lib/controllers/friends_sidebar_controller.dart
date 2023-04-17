import 'package:get/get.dart';
import 'package:sidebarx/sidebarx.dart';

import '../services/room_service.dart';

class FriendsSideBarController extends GetxController {
  final RoomService roomService = Get.find();

  final friendsSideBarController = SidebarXController(selectedIndex: 0);


}