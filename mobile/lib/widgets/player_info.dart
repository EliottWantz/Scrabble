import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class PlayerInfo extends StatelessWidget {
  final String playerName;
  final bool isPlayerTurn;
  final int score;
  final bool isBot;

  PlayerInfo({
    Key? key,
    required this.playerName,
    required this.isPlayerTurn,
    required this.score,
    required this.isBot});

  @override
  Widget build(BuildContext context) {
    return Container(
        width: 200,
        height: 100,
        decoration: isPlayerTurn
          ? BoxDecoration(
            color: Colors.blueAccent,
            borderRadius: BorderRadius.circular(12),
          )
          : BoxDecoration(
            color: Colors.grey,
            borderRadius: BorderRadius.circular(12),
          ),
        child: Column(
          children: [
            Text(playerName),
            Text('Score : ${score.toString()}')
          ],
        )
    );
  }
}