import 'package:chat_bubbles/chat_bubbles.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class Chatbox extends StatelessWidget {
  Chatbox({super.key});

  WebsocketService chatController = Get.put(WebsocketService());


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Expanded(
              child: ListView.builder(
                  itemCount: 5,
                  itemBuilder: (context, index) {
                    return const BubbleSpecialThree(
                      text: 'Added iMassage shape bubbles',
                      color: Color(0xFF1B97F3),
                      tail: false,
                      textStyle: TextStyle(
                          color: Colors.white,
                          fontSize: 16
                      ),
                    );
            })
          )
        ],
      )
    );
  }
}