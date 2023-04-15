import 'package:client_leger/controllers/create_room_controller.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/screens/friend_request_screen.dart';
import 'package:client_leger/services/room_service.dart';
import 'package:client_leger/services/users_service.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:client_leger/widgets/pending_requests_list.dart';
import 'package:client_leger/widgets/search_bar.dart';
import 'package:client_leger/widgets/user_list.dart';
import 'package:flutter/cupertino.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class FriendsController extends GetxController {
  final UserService userService = Get.find();
  final RoomService roomService = Get.find();
  final WebsocketService websocketService = Get.find();
  final UsersService usersService = Get.find();
  List<Widget> widgetOptions = [];

  RxString searchInput = ''.obs;

  final List<dynamic> items = [
    'Friend1',
    'Friend2',
    'Friend3',
    'Friend4',
    'Friend1',
    'Friend2',
    'Friend3',
    'Friend4',
    'Friend1',
    'Friend2',
    'Friend3',
    'Friend4',
  ];

  final List<String> items2 = [
    'Friend1',
    'Friend2',
    'Friend3',
    'Friend4',
  ];

  FriendsController() {
    print(items);
    widgetOptions = <Widget>[
      // UserList(items: filterUsersListBy(searchInput.value, userService.friends.value)),
      Column(children: [
        SearchBar(searchInput),
        Expanded(child: Obx(() => UserList(mode: 'friendList', inputSearch: searchInput, items: userService.friends.value)))
        // Expanded(child: UserList(inputSearch: searchInput, items: usersService.users.value))
      ]),
      Column(children: [
        SearchBar(searchInput),
        Expanded(child: UserList(mode: 'friendList', inputSearch: searchInput, items: items2))
      ]),
      // UserList(items: userService.friends.value),
      // UserList(items: items2),
      PendingRequestsList(),
      FriendRequestScreen()
      // Column(
      //   children: [
      //     TextButton(
      //       onPressed: () {
      //         // websocketService.createRoom('new room');
      //         websocketService.createRoom('new room');
      //       },
      //       child: Text('TextButton'),
      //     ),
      //     TextButton(
      //       onPressed: () {
      //         // websocketService.createRoom('new room');
      //         websocketService.sendMessage('global', 'hello global');
      //       },
      //       child: Text('TextButton'),
      //     )
      //   ],
      // )
      // const Text(
      //   'Index 3: Work',
      // ),
      // TextButton(
      //   onPressed: () {
      //     // websocketService.createRoom('new room');
      //     websocketService.sendMessage('global', 'hello global');
      //   },
      //   child: Text('TextButton'),
      // )
    ];
  }

  late RxInt selectedIndex = 0.obs;
  // final List<Widget> widgetOptions = <Widget>[
  //   UserList(items: items),
  //   UserList(),
  //   const Text(
  //     'Index 2: School',
  //   ),
  // ];

  void onItemTapped(int index) {
    selectedIndex.value = index;
    print(selectedIndex.value);
  }

  // List<User> filterUsersListBy(String filter, List<dynamic> list) {
  //   List<User> filteredUserList = [];
  //   for (final user in list) {
  //     if (user.username.startsWith(filter)) {
  //       filteredUserList.add(user);
  //     }
  //   }
  //   return filteredUserList;
  // }
  List<String> filterUsersListBy(String filter, List<dynamic> list) {
    List<String> filteredUserList = [];
    for (final user in list) {
      if (user.startsWith(filter)) {
        filteredUserList.add(user);
      }
    }
    return filteredUserList;
  }
}