import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class PlayerInfo extends StatelessWidget {
  final String playerName;
  final bool isPlayerTurn;
  final int score;
  final bool isBot;

  PlayerInfo(
      {Key? key,
      required this.playerName,
      required this.isPlayerTurn,
      required this.score,
      required this.isBot});

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.topCenter,
      children: <Widget>[
        Container(
          height: 85,
          width: 200,
          margin: const EdgeInsets.only(
            top: 20,
          ),
          child: Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.all(Radius.circular(12)),
                side: BorderSide(
                  color: Get.isDarkMode ? Colors.greenAccent : Colors.black,
                ),
              ),
              shadowColor:
                  isPlayerTurn ? Colors.blueAccent : Colors.transparent,
              elevation: isPlayerTurn ? 25 : 0,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.start,
                children: <Widget>[
                  Padding(
                    padding: const EdgeInsets.only(
                        top: 40, bottom: 2, left: 10, right: 10),
                    child: Column(
                      children: <Widget>[
                        Text(
                          playerName,
                        ),
                        Text(
                          'score : ${score}',
                        ),
                      ],
                    ),
                  )
                ],
              )),
        ),
        circularImageWithBorder(
            'https://ucarecdn.com/add70d69-c5c0-46b3-9a36-10c62fb0bf61/'),
      ],
    );
  }

  Widget circularImageWithBorder(String imgPath) {
    return Container(
      width: 50.0,
      height: 50.0,
      decoration: BoxDecoration(
        color: const Color(0xff7c94b6),
        image: DecorationImage(
          image: NetworkImage(imgPath),
          fit: BoxFit.cover,
        ),
        borderRadius: const BorderRadius.all(Radius.circular(25.0)),
        border: Border.all(
          color: Colors.black,
          width: 2.0,
        ),
      ),
    );
  }
}
