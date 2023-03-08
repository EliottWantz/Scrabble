import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

class ChatScreen extends StatelessWidget {
  ChatScreen({Key? key}) : super(key: key);

  final List<String> messages = [
    'message1',
    'message2',
    'message3',
    'message4',
    'message5',
    'message6',
    'message7',
    'message8',
    'message9',
    'message10',
    'message1',
    'message2',
    'message3',
    'message4',
    'message5',
    'message6',
    'message7',
    'message8',
    'message9',
    'message10',
  ];

  final ScrollController scrollController = ScrollController();

  void scrollDown() {
    scrollController.jumpTo(scrollController.position.maxScrollExtent);
  }

  @override
  Widget build(BuildContext context) {
    SchedulerBinding.instance.addPostFrameCallback((timeStamp) {
      scrollDown();
    });
    return Column(
      children: [
        Expanded(
          child: Center(
            child: ListView.builder(
              controller: scrollController,
              itemCount: messages.length,
              padding: const EdgeInsets.all(8),
              itemBuilder: (context, index) {
                return Container(
                  margin: EdgeInsets.only(bottom: 10),
                  padding: EdgeInsets.all(10),
                  height: 50,
                  color: Colors.amber[600],
                  child: Center(child: Text(messages[index])),
                );
              }
                // [
                //   Container(
                //     height: 50,
                //     color: Colors.amber[600],
                //     child: const Center(child: Text('Entry A')),
                //   ),
                //   Container(
                //     height: 50,
                //     color: Colors.amber[500],
                //     child: const Center(child: Text('Entry B')),
                //   ),
                //   Container(
                //     height: 50,
                //     color: Colors.amber[100],
                //     child: const Center(child: Text('Entry C')),
                //   ),
                // ],
            )
          )
        ),
        Container(
          margin: const EdgeInsets.all(8),
          padding: const EdgeInsets.all(8),
          child: const Center(child: Text('Your super cool Footer')),
          color: Colors.amber,
        )
      ]
    );

    // return Column(
    //   children: [
    //     // Expanded(
    //       SingleChildScrollView(
    //         child: Column(
    //           children: [
    //             Text('Message 1'),
    //             Text('Message 2'),
    //             Text('Message 3'),
    //           ],
    //         ),
    //       ),
    //     // ),
    //     Container(
    //       child: Text('Your super cool Footer'),
    //       color: Colors.amber,
    //     )
    //   ],
    // );


    // return SafeArea(
    //   minimum: const EdgeInsets.symmetric(horizontal: 40.0),
    //   child: Center(
    //     child: SizedBox(
    //       width: 300,
    //       child: Column(
    //         mainAxisAlignment: MainAxisAlignment.center,
    //         children: const [
    //           Text('Chat',style: TextStyle(fontSize: 30),),
    //         ],
    //       ),
    //     ),
    //   ),
    // );
  }
}