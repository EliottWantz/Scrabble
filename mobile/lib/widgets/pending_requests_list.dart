import 'package:client_leger/services/room_service.dart';
import 'package:client_leger/services/users_service.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';

import '../services/user_service.dart';

class PendingRequestsList extends StatelessWidget {
  PendingRequestsList({Key? key}) : super(key: key);

  final UserService _userService = Get.find();
  final UsersService _usersService = Get.find();
  final WebsocketService _websocketService = Get.find();
  final RoomService _roomService = Get.find();

  @override
  Widget build(BuildContext context) {
    return Scrollbar(
        child: _buildList()
    );
  }

  Widget _buildList() {
    return Obx(() => ListView.builder(
      padding: const EdgeInsets.all(16.0),
      itemCount: _userService.pendingRequest.value!.length,
      itemBuilder: (context, item) {
        // if (item.isEven) return Divider();

        final index = item;

        // if (index >= _randomWordPairs.length) {
        //   _randomWordPairs.addAll(generateWordPairs().take(10));
        // }

        // return _buildRow(_randomWordPairs[index]);
        return _buildRow(_userService.pendingRequest.value![index]);
      },
    ));
  }

  Widget _buildRow(dynamic username) {
    return Column(
      children: [
        const Divider(),
        ListTile(
          title: Text(username, style: TextStyle(fontSize: 18.0)),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                  onPressed: () async {
                    final res = await _usersService.acceptFriendRequest(username);
                    if (res == true) {
                      _userService.pendingRequest.remove(username);
                      _userService.user.value!.pendingRequests.remove(username);
                      // _userService.user.value!.friends.add(username);
                      _userService.friends.add(username);
                      String toId = _usersService.getUserId(username);
                      if (!_roomService.roomMapContains('${_userService.user.value!.username}/${username}')) {
                        _websocketService.createDMRoom(toId, username);
                      }
                    }
                  },
                  icon: const Icon(Icons.check)
              ),
              IconButton(
                  onPressed: () async {
                    await _usersService.deleteFriendRequest(username);
                  },
                  icon: const Icon(Icons.close)
              )
            ]
          ),
          // onTap: () {
          //   setState(() {
          //     if (alreadySaved) {
          //       _savedWordPairs.remove(pair);
          //     } else {
          //       _savedWordPairs.add(pair);
          //     }
          //   });
          // }
        )
      ],
    );
  }
}
