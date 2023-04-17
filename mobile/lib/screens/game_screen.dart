import 'dart:math';

import 'package:client_leger/controllers/game_controller.dart';
import 'package:client_leger/models/player.dart';
import 'package:client_leger/models/tile.dart';
import 'package:client_leger/models/tile_info.dart';
import 'package:client_leger/screens/floating_chat_screen.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/widgets/board.dart';
import 'package:client_leger/widgets/board_tile.dart';
import 'package:client_leger/widgets/game_chat.dart';
import 'package:client_leger/widgets/timer.dart';
import 'package:flutter/material.dart';
import 'package:flutter_layout_grid/flutter_layout_grid.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

import '../models/move_info.dart';
import '../models/move_types.dart';
import '../services/room_service.dart';
import '../widgets/player_info.dart';

class GameScreen extends GetView<GameController> {
  GameScreen({Key? key}) : super(key: key);
  final GameService _gameService = Get.find();
  final RoomService _roomService = Get.find();
  final SettingsService _settingsService = Get.find();
  final bool isObserving = Get.arguments[0];
  final bool isTournamentGame = Get.arguments[1];

  final isDialOpen = ValueNotifier(false);
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  RxBool selectedChatRoom = false.obs;

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (isDialOpen.value) {
          isDialOpen.value = false;
          return false;
        } else {
          return true;
        }
      },
      child: Scaffold(
        resizeToAvoidBottomInset: true,
        drawerScrimColor: Colors.transparent,
        floatingActionButton: FloatingActionButton(
          onPressed: () {
            _scaffoldKey.currentState?.openEndDrawer();
          },
          backgroundColor: const Color.fromARGB(255, 98, 0, 238),
          foregroundColor: Colors.white,
          autofocus: true,
          focusElevation: 5,
          child: const Icon(
            Icons.question_answer_rounded,
          ),
        ),
        key: _scaffoldKey,
        endDrawer: Drawer(child: Obx(() => _buildChatRoomsList())),
        body: _gameService.currentGame.value == null
            ? const SizedBox()
            : Obx(() => SingleChildScrollView(child: _chooseLayout(context))),
      ),
    );
  }

  Widget _chooseLayout(BuildContext context) {
    if (controller.isObserverSwitched.value == false && isObserving) {
      return _buildLayoutForObserver(context);
    }
    return _buildLayoutForPlayer(context);
  }

  Widget _buildLayoutForObserver(BuildContext context) {
    return LayoutGrid(
      areas: '''
            leave  content  settings
            nav    content  aside
            nav    content  aside
            nav    easel  .
          ''',
      columnSizes: [1.fr, 2.fr, 1.fr],
      rowSizes: [
        40.px,
        auto,
        auto,
        120.px,
      ],
      children: [
        Align(
          alignment: Alignment.topCenter,
          child: Padding(
            padding: const EdgeInsets.only(top: 5),
            child: ElevatedButton.icon(
              onPressed: () {
                if (isTournamentGame) {
                  controller.onLeaveTournament();
                } else {
                  controller.onLeaveGame();
                }
              },
              icon: const Icon(
                Icons.exit_to_app_rounded,
                size: 20,
              ),
              label: const Text('Quitter la partie'), // <-- Text
            ),
          ),
        ).inGridArea('leave'),
        Padding(
          padding: const EdgeInsets.only(top: 5, right: 5),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Obx(() => DropdownButton<String>(
                    underline: const SizedBox(),
                    value: _settingsService.currentLangValue.value,
                    style: Theme.of(context).textTheme.button,
                    items: const [
                      DropdownMenuItem(
                        child: Center(child: Text('Français')),
                        value: 'fr',
                      ),
                      DropdownMenuItem(
                          child: Center(child: Text('Anglais')), value: 'en')
                    ],
                    onChanged: (String? value) async {
                      await _settingsService.switchLang(value!);
                    },
                    icon: const Icon(
                      Icons.language,
                    ),
                  )),
              const Gap(20),
              InkWell(
                  onTap: () {
                    _settingsService.switchTheme();
                  },
                  child: Obx(
                    () => Icon(
                      _settingsService.currentThemeIcon.value,
                      size: 30,
                    ),
                  )),
              const Gap(10),
            ],
          ),
        ).inGridArea('settings'),
        Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Obx(() => Timer(
                  time:
                      _gameService.currentGameTimer.value ?? 60 * pow(10, 9))),
              const Gap(100),
              Card(
                shape: RoundedRectangleBorder(
                  borderRadius: const BorderRadius.all(Radius.circular(12)),
                  side: BorderSide(
                    color: Get.isDarkMode ? Colors.greenAccent : Colors.black,
                  ),
                ),
                elevation: 10,
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Obx(() => Text(
                        'Lettres en réserve \n ${controller.gameService.currentGame.value!.tileCount ?? 0}',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.headline6,
                      )),
                ),
              ),
              const Gap(100),
            ],
          ),
        ).inGridArea('aside'),
        Align(
          alignment: Alignment.topCenter,
          child: Obx(() => Column(
                children: _buildPlayersInfo(),
              )),
        ).inGridArea('nav'),
        ScrabbleBoard().inGridArea('content'),
        Obx(() => _gameService.currentGame.value == null
            ? const SizedBox()
            : SizedBox(
                height: 80,
                child: Align(
                  alignment: Alignment.bottomCenter,
                  child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: _buildEaselForObserver()),
                ),
              )).inGridArea('easel'),
      ],
    );
  }

  Widget _buildLayoutForPlayer(BuildContext context) {
    if (controller.gameService.currentGame.value != null) {
      return LayoutGrid(
        areas: '''
            leave  content  settings
            nav    content  aside
            nav    content  aside
            options    easel  passer
          ''',
        rowGap: 5,
        columnSizes: [1.fr, 2.fr, 1.fr],
        rowSizes: const [
          auto,
          auto,
          auto,
          auto,
        ],
        children: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(top: 5),
              child: ElevatedButton.icon(
                onPressed: () {
                  controller.onLeaveGame();
                },
                icon: const Icon(
                  Icons.exit_to_app_rounded,
                  size: 20,
                ),
                label: const Text('Quitter la partie'), // <-- Text
              ),
            ),
          ).inGridArea('leave'),
          Padding(
            padding: const EdgeInsets.only(top: 5, right: 5),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Obx(() =>
                    DropdownButton<String>(
                      underline: const SizedBox(),
                      value: _settingsService.currentLangValue.value,
                      style: Theme
                          .of(context)
                          .textTheme
                          .button,
                      items: const [
                        DropdownMenuItem(
                          child: Center(child: Text('Français')),
                          value: 'fr',
                        ),
                        DropdownMenuItem(
                            child: Center(child: Text('Anglais')), value: 'en')
                      ],
                      onChanged: (String? value) async {
                        await _settingsService.switchLang(value!);
                      },
                      icon: const Icon(
                        Icons.language,
                      ),
                    )),
                const Gap(20),
                InkWell(
                    onTap: () {
                      _settingsService.switchTheme();
                    },
                    child: Obx(
                          () =>
                          Icon(
                            _settingsService.currentThemeIcon.value,
                            size: 30,
                          ),
                    )),
                const Gap(10),
              ],
            ),
          ).inGridArea('settings'),
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Obx(() =>
                    Timer(
                        time:
                        _gameService.currentGameTimer.value ??
                            60 * pow(10, 9))),
                const Gap(100),
                Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: const BorderRadius.all(Radius.circular(12)),
                    side: BorderSide(
                      color: Get.isDarkMode ? Colors.greenAccent : Colors.black,
                    ),
                  ),
                  elevation: 10,
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Obx(() =>
                        Text(
                          'Lettres en réserve \n ${
                              controller.gameService.currentGame.value == null
                                  ? 0
                                  : controller.gameService.currentGame.value!
                                  .tileCount
                          }',
                          textAlign: TextAlign.center,
                          style: Theme
                              .of(context)
                              .textTheme
                              .headline6,
                        )),
                  ),
                ),
                const Gap(100),
                Obx(() =>
                    ElevatedButton.icon(
                      onPressed: controller.isClientTurn() // &&
                      // !_gameService.getIndicesHasBeenCalled
                          ? () {
                        _gameService.indices.isNotEmpty
                            ? Get.bottomSheet(
                          SizedBox(
                            height: 65,
                            width: 300,
                            child: Form(
                              key: controller.dropdownFormKey,
                              child: Row(
                                mainAxisAlignment:
                                MainAxisAlignment.center,
                                children: [
                                  SizedBox(
                                    height: 65,
                                    width: 300,
                                    child: DropdownButtonFormField<
                                        MoveInfo>(
                                      menuMaxHeight: 200,
                                      alignment: AlignmentDirectional
                                          .bottomCenter,
                                      hint: Text(
                                        'Choisissez un placement',
                                        style: Get.textTheme.button,
                                      ),
                                      decoration: InputDecoration(
                                        enabledBorder:
                                        OutlineInputBorder(
                                          borderSide:
                                          const BorderSide(
                                              color: Colors.blue,
                                              width: 2),
                                          borderRadius:
                                          BorderRadius.circular(
                                              20),
                                        ),
                                        border: OutlineInputBorder(
                                          borderSide:
                                          const BorderSide(
                                              color: Colors.blue,
                                              width: 2),
                                          borderRadius:
                                          BorderRadius.circular(
                                              20),
                                        ),
                                        filled: true,
                                        fillColor:
                                        Get.theme.primaryColor,
                                      ),
                                      validator: (value) =>
                                      value ==
                                          null
                                          ? "Choisissez un placement"
                                          : null,
                                      dropdownColor:
                                      Get.theme.primaryColor,
                                      onChanged: (MoveInfo? value) {
                                        controller.currentIndiceToPlay
                                            .value = value;
                                      },
                                      isExpanded: true,
                                      items: _gameService.indices
                                          .map((moveInfo) =>
                                          DropdownMenuItem(
                                              value: moveInfo,
                                              child: Text(
                                                  "${moveInfo
                                                      .letters} ${moveInfo
                                                      .covers} ${moveInfo
                                                      .score} points")))
                                          .toList(),
                                    ),
                                  ),
                                  const Gap(20),
                                  ElevatedButton.icon(
                                      onPressed: () {
                                        controller.placeIndice(
                                            controller
                                                .currentIndiceToPlay
                                                .value as MoveInfo);
                                        Get.back();
                                      },
                                      icon: const Icon(Icons.check),
                                      label: const Text('Confirmer'))
                                ],
                              ),
                            ),
                          ),
                          isDismissible: false,
                          barrierColor: Colors.transparent,
                          enableDrag: false,
                        )
                            : Get.snackbar(
                          "Pas d'indices disponible pour l'instant!",
                          "Veuillez échanger vos lettres ou passer votre tour!",
                          icon: const Icon(Icons.warning),
                          shouldIconPulse: true,
                          barBlur: 20,
                          isDismissible: true,
                          duration: const Duration(seconds: 3),
                        );
                      }
                          : null,
                      icon: const Icon(
                        Icons.lightbulb,
                        size: 30,
                      ),
                      label: const Text('Indices'),
                    )),
              ],
            ),
          ).inGridArea('aside'),
          Obx(() =>
              Align(
                alignment: Alignment.topCenter,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: _buildPlayersInfo(),
                ),
              )).inGridArea('nav'),
          ScrabbleBoard().inGridArea('content'),
          Obx(() =>
              SizedBox(
                height: 80,
                child: Align(
                  alignment: Alignment.bottomCenter,
                  child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: _gameService
                          .getPlayer()!
                          .rack
                          .tiles
                          .asMap()
                          .map((idx, e) => MapEntry(idx, _buildEasel(e, idx)))
                          .values
                          .toList()),
                ),
              )).inGridArea('easel'),
          Obx(() =>
              Center(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    ElevatedButton.icon(
                      onPressed: controller.isClientTurn()
                          ? () {
                        controller.placeLetters();
                      }
                          : null,
                      icon: const Icon(
                        Icons.check,
                        size: 20,
                      ),
                      label: const Text('Placer'),
                    ),
                    ElevatedButton.icon(
                      onPressed: controller.isClientTurn()
                          ? () {
                        controller.exchangeLetters();
                      }
                          : null,
                      icon: const Icon(
                        Icons.change_circle,
                        size: 20,
                      ),
                      label: const Text('Échanger'), // <-- Text
                    ),
                  ],
                ),
              )).inGridArea('options'),
          Obx(() =>
              Align(
                  alignment: Alignment.center,
                  child: ElevatedButton.icon(
                    onPressed: controller.isClientTurn()
                        ? () {
                      controller.skipTurn();
                    }
                        : null,
                    icon: const Icon(
                      Icons.double_arrow,
                      size: 20,
                    ),
                    label: const Text('Passer'), // <-- Text
                  ))).inGridArea('passer'),
        ],
      );
    } else {
      return const SizedBox(width: 0, height: 0);
    }
  }

  List<Widget> _buildEaselForObserver() {
    if (controller.currentObservedPlayerId.value == null) {
      return [
        Center(
            child: Text(
          'Veuillez choisir un joueur à observer',
          style: Get.textTheme.headline6,
        ))
      ];
    } else if (_gameService
        .getPlayerRackById(controller.currentObservedPlayerId.value!)!
        .tiles
        .isEmpty) {
      return [
        Center(
            child: Text(
          'Plus de lettres disponibles :(',
          style: Get.textTheme.headline6,
        ))
      ];
    }
    return _gameService
        .getPlayerRackById(controller.currentObservedPlayerId.value as String)!
        .tiles
        .asMap()
        .map((idx, e) => MapEntry(idx, _buildEasel(e, idx)))
        .values
        .toList();
  }

  Widget _buildEasel(Tile tile, int index) {
    return controller.getEaselChildToDisplay(tile, index, isObserving);
  }

  List<Widget> _buildPlayersInfo() {
    List<Widget> playerInfoPanels = [];
    if (_gameService.currentGame.value == null) return playerInfoPanels;
    for (final player in _gameService.currentGame.value!.players) {
      playerInfoPanels.add(const Gap(20));
      playerInfoPanels.add(PlayerInfo(
          playerName: player.username,
          isObserving: isObserving,
          isPlayerTurn: _gameService.isCurrentPlayerTurn(player.id),
          playerId: player.id,
          score: player.score,
          isBot: player.isBot));
      playerInfoPanels.add(const Gap(20));
    }
    return playerInfoPanels;
  }

  Widget _buildIndices() {
    return Container(
        height: 300,
        width: 500,
        child: Obx(() => ListView.builder(
              padding: EdgeInsets.zero,
              itemCount: _gameService.indices.value!.length,
              itemBuilder: (context, item) {
                final index = item;
                return _buildIndice(_gameService.indices.value![index]);
              },
            )));
  }

  Widget _buildIndice(MoveInfo moveInfo) {
    return Row(
      children: [
        Text("${moveInfo.letters} ${moveInfo.covers}"),
        ElevatedButton.icon(
          onPressed: () {
            controller.placeIndice(moveInfo);
          },
          icon: const Icon(
            Icons.check,
            size: 20,
          ),
          label: const Text('Placer'),
        ),
      ],
    );
  }

  Widget _buildChatRoomsList() {
    if (!selectedChatRoom.value) {
      print("selectedchatroom value");
      print(selectedChatRoom);
      return Column(
        children: [
          Container(
            color: const Color.fromARGB(255, 98, 0, 238),
            height: 60,
            width: double.infinity,
            child: const DrawerHeader(
              child: Text(
                'Chats',
                style: TextStyle(fontSize: 20, color: Colors.white),
              ),
            ),
          ),
          Expanded(
              child: ListView.builder(
            // padding: const EdgeInsets.all(16.0),
            padding: EdgeInsets.zero,
            itemCount: _roomService.getRooms().length,
            itemBuilder: (context, item) {
              final index = item;
              return _buildChatRoomRow(_roomService.getRooms()[index].roomName,
                  _roomService.getRooms()[index].roomId);
            },
          ))
        ],
      );
    } else {
      print("selectedchatroom value");
      print(selectedChatRoom);
      return FloatingChatScreen(selectedChatRoom);
    }
  }

  Widget _buildChatRoomRow(String roomName, String roomId) {
    return Column(
      children: [
        ListTile(
          title: Text(roomName.split('/').length > 1
              ? roomName.split('/')[1]
              : roomName),
          // onTap: () => Get.toNamed(Routes.CHAT, arguments: {'text': 'roomName'}),
          onTap: () {
            selectedChatRoom.value = !selectedChatRoom.value;
            _roomService.currentFloatingChatRoomId.value = roomId;
            _roomService.updateCurrentFloatingRoomMessages();
          },
        ),
        const Divider(),
      ],
    );
  }
}
