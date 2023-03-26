import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
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
    required List<dynamic> items,
  }) : _items = items,
        super(key: key);

  final UserService _userService = Get.find();
  final UsersService _usersService = Get.find();

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
    return Scrollbar(
        child: _buildList()
    );
  }

  Widget _buildList() {
    return Obx(() => ListView.builder(
      padding: const EdgeInsets.all(16.0),
      // itemCount: _items.length,
      itemCount: _userService.friends.value!.length,
      itemBuilder: (context, item) {
        // if (item.isEven) return Divider();

        final index = item;

        // if (index >= _randomWordPairs.length) {
        //   _randomWordPairs.addAll(generateWordPairs().take(10));
        // }

        // return _buildRow(_randomWordPairs[index]);
        return _buildRow(_userService.friends.value![index]);
      },
    ));
  }

  Widget _buildRow(dynamic username) {
    return Column(
      children: [
        const Divider(),
        ListTile(
          title: Text(username, style: TextStyle(fontSize: 18.0)),
          trailing:
                IconButton(
                    onPressed: () async {
                      final res = await _usersService.deleteFriend(username);
                      if (res == true) {
                        _userService.user.value!.friends.remove(username);
                        _userService.friends.remove(username);
                      }
                    },
                    icon: const Icon(Icons.close)
                ),
          onTap: () {

          }
          ),
          // trailing: Icon(alreadySaved ? Icons.favorite : Icons.favorite_border,
          //     color: alreadySaved ? Colors.red : null),
      ],
    );
  }
}