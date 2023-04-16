import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/controllers/create_room_controller.dart';
import 'package:client_leger/models/requests/game_invite_request.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/services/room_service.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';

import '../services/user_service.dart';
import '../services/users_service.dart';

// class UserList extends StatefulWidget {
//   @override
//   UserListState createState() => UserListState();
// }

class UserList extends StatelessWidget {
  UserList({
    Key? key,
    required String mode,
    required RxString inputSearch,
    required List<dynamic> items,
  }) : _mode = mode,
        _inputSearch = inputSearch,
        _items = items,
        super(key: key);

  final UserService _userService = Get.find();
  final UsersService _usersService = Get.find();
  final GameService _gameService = Get.find();
  final ApiRepository _apiRepository = Get.find();
  final RoomService _roomService = Get.find();
  final WebsocketService _websocketService = Get.find();

  final RxString _inputSearch;

  final String _mode;

  RxBool isChecked = false.obs;

  final RxList<dynamic> _itemsObs = <dynamic>[].obs;
  final List<dynamic> _items; // = [
  //   'Friend1',
  //   'Friend2',
  //   'Friend3',
  //   'Friend4',
  //   'Friend1',
  //   'Friend2',
  //   'Friend3',
  //   'Friend4',
  //   'Friend1',
  //   'Friend2',
  //   'Friend3',
  //   'Friend4',
  // ];

  Widget build(BuildContext context) {
    return Obx(() => Scrollbar(
          child: _buildList(_inputSearch.value)
      ),
    );
  }

  final ScrollController scrollController = ScrollController();

  void scrollDown() {
    scrollController.jumpTo(scrollController.position.minScrollExtent);
  }

  Widget _buildList(String inputSearch) {
    SchedulerBinding.instance.addPostFrameCallback((timeStamp) {
      scrollDown();
    });

    List<String> friendListUsernames = _usersService.getUsernamesFromUserIds(_items);
    List<String> filteredItems = filterUsersListBy(_inputSearch.value, friendListUsernames);

    return ListView.builder(
        controller: scrollController,
        padding: const EdgeInsets.all(16.0),
        itemCount: filteredItems.length,
        // itemCount: _userService.friends.value!.length,
        itemBuilder: (context, item) {
          // if (item.isEven) return Divider();

          final index = item;

          // if (index >= _randomWordPairs.length) {
          //   _randomWordPairs.addAll(generateWordPairs().take(10));
          // }
          // if (_items[index].startsWith(_inputSearch.value)) {
          //   return _buildRow(_items[index]);
          // }
          return _buildRow(filteredItems[index], index);
          // return _buildRow(_randomWordPairs[index]);
          // return _buildRow(_userService.friends.value![index]);
          // return _buildRow(_items[index]);
        },
    );
  }

  Widget _buildRow(dynamic username, int index) {
    if (_mode == 'checkList') {
      return Column(
        children: [
          const Divider(),
          ListTile(
              title: Text(username, style: TextStyle(fontSize: 18.0)),
              trailing:
                Obx(() => _buildTrailingButton(username, index)),
              onTap: () {

              }
          ),
          // trailing: Icon(alreadySaved ? Icons.favorite : Icons.favorite_border,
          //     color: alreadySaved ? Colors.red : null),
        ],
      );
    }
    return Column(
      children: [
        const Divider(),
        ListTile(
          title: Text(username, style: TextStyle(fontSize: 18.0)),
          trailing:
            _buildTrailingButton(username),
          onTap: () {

          }
          ),
          // trailing: Icon(alreadySaved ? Icons.favorite : Icons.favorite_border,
          //     color: alreadySaved ? Colors.red : null),
      ],
    );
  }

  List<String> filterUsersListBy(String filter, List<dynamic> list) {
    List<String> filteredUserList = [];
    for (final user in list) {
      if (user.contains(filter)) {
        filteredUserList.add(user);
      }
    }
    return filteredUserList;
  }

  Widget _buildTrailingButton(dynamic username, [int? index]) {
    if (_mode == 'gameInvite') {
      return IconButton(
            onPressed: () async {
              if (!_gameService.sentGameInvitesUsernames.contains(username)) {
                GameInviteRequest gameInviteRequest = GameInviteRequest(
                    invitedId: _usersService.getUserId(username),
                    inviterId: _userService.user.value!.id,
                    gameId: _gameService.currentGameId);
                final res = await _apiRepository.gameInvite(gameInviteRequest);
                if (res == true) {
                  _gameService.sentGameInvitesUsernames.add(username);
                }
              }
            },
            icon: Obx(() => _buildTrailingIcon(username))
      );
    } else if (_mode == 'friendList') {
      return IconButton(
          onPressed: () async {
            final res = await _usersService.deleteFriend(username);
            if (res == true) {
              _userService.user.value!.friends.remove(username);
              _userService.friends.remove(_usersService.getUserId(username));
            }
          },
          icon: const Icon(Icons.close)
      );
    } else if (_mode == 'checkList') {
      return Checkbox(
        checkColor: Colors.white,
        fillColor: MaterialStateProperty.resolveWith(getColor),
        value: _itemsObs.value.contains(_usersService.getUserId(username)),
        onChanged: (bool? value) {
          if (_itemsObs.value.contains(_usersService.getUserId(username))) {
            _itemsObs.remove(_usersService.getUserId(username));
            _roomService.newRoomUserIds.clear();
            _roomService.newRoomUserIds.addAll(_itemsObs.value);
            print(_roomService.newRoomUserIds);
          } else {
            _itemsObs.add(_usersService.getUserId(username));
            _roomService.newRoomUserIds.clear();
            _roomService.newRoomUserIds.addAll(_itemsObs.value);
            print(_roomService.newRoomUserIds);
          }
        },
      );
    } else if (_mode == 'joinRoom') {
      return IconButton(
          onPressed: () {
            if (_roomService.roomsMap.containsKey(_roomService.getListedChatRoomIdByName(username))) {
              _websocketService.leaveChatRoom(_roomService.getListedChatRoomIdByName(username));
            } else {
              _websocketService.joinChatRoom(_roomService.getListedChatRoomIdByName(username));
            }
          },
          icon: Obx(() => _buildServerTrailingIcon(username))
      );
    } else {
      return IconButton(
          onPressed: () async {
            final res = await _usersService.deleteFriend(username);
            if (res == true) {
              _userService.user.value!.friends.remove(username);
              _userService.friends.remove(_roomService.getRoomIdByRoomName(username));
              _roomService.roomsMap.remove(_roomService.getRoomIdByRoomName(username));
            }
          },
          icon: const Icon(Icons.close)
      );
    }
  }

  Color getColor(Set<MaterialState> states) {
    const Set<MaterialState> interactiveStates = <MaterialState>{
      MaterialState.pressed,
      MaterialState.hovered,
      MaterialState.focused,
    };
    if (states.any(interactiveStates.contains)) {
      return Color.fromARGB(255,98,0,238);
    }
    return Color.fromARGB(255,98,0,238);
  }

  Widget _buildTrailingIcon(String username) {
    if (_gameService.sentGameInvitesUsernames.contains(username)) {
      return const Icon(Icons.check, color: Colors.green);
    } else {
      return const Icon(Icons.send);
    }
  }

  Widget _buildServerTrailingIcon(String roomName) {
    if (_roomService.roomsMap.containsKey(_roomService.getListedChatRoomIdByName(roomName))) {
      return const Icon(Icons.exit_to_app);
    } else {
      return const Icon(Icons.add);
    }
  }
}