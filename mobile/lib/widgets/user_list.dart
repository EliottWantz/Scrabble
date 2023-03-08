import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

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
    return ListView.builder(
      padding: const EdgeInsets.all(16.0),
      itemCount: _items.length,
      itemBuilder: (context, item) {
        // if (item.isEven) return Divider();

        final index = item;

        // if (index >= _randomWordPairs.length) {
        //   _randomWordPairs.addAll(generateWordPairs().take(10));
        // }

        // return _buildRow(_randomWordPairs[index]);
        return _buildRow(_items[index]);
      },
    );
  }

  Widget _buildRow(dynamic username) {
    return Column(
      children: [
        Divider(),
        ListTile(
          title: Text(username, style: TextStyle(fontSize: 18.0)),
          // trailing: Icon(alreadySaved ? Icons.favorite : Icons.favorite_border,
          //     color: alreadySaved ? Colors.red : null),
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