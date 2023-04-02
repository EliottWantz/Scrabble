import 'package:client_leger/controllers/game_controller.dart';
import 'package:client_leger/services/users_service.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class PlayerInfo extends GetView<GameController> {
  final String playerName;
  final String playerId;
  final bool isPlayerTurn;
  final bool isObserving;
  final int score;
  final bool isBot;
  final UsersService usersService = Get.find();

  PlayerInfo(
      {Key? key,
      required this.playerName,
      required this.isObserving,
      required this.playerId,
      required this.isPlayerTurn,
      required this.score,
      required this.isBot});

  @override
  Widget build(BuildContext context) {
    return isObserving == false ? _buildForPlayer() : _buildForObserver();
  }

  Widget _buildForObserver() {
    return Stack(
      alignment: Alignment.topCenter,
      children: <Widget>[
        Container(
          height: 130,
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
              surfaceTintColor:
                  isPlayerTurn ? Colors.blueAccent : Colors.transparent,
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
                        Obx(() => ElevatedButton.icon(
                            onPressed: playerId ==
                                    controller.currentObservedPlayerId.value
                                ? null
                                : () {
                                    controller.currentObservedPlayerId.value =
                                        playerId;
                                  },
                            icon: Icon(Icons.remove_red_eye_outlined),
                            label: Text('Observer')))
                      ],
                    ),
                  )
                ],
              )),
        ),
        circularImageWithBorder(isBot
            ? 'https://api.dicebear.com/6.x/bottts/png?seed=Felix&scale=70'
            : usersService.getUserById(playerId)!.avatar.url),
      ],
    );
  }

  Widget _buildForPlayer() {
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
        circularImageWithBorder(isBot
            ? 'https://api.dicebear.com/6.x/bottts/png?seed=Felix&scale=70'
            : usersService.getUserById(playerId)!.avatar.url),
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
