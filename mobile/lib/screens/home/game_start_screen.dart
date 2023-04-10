import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/controllers/home_controller.dart';
import 'package:client_leger/models/game.dart';
import 'package:client_leger/models/game_room.dart';
import 'package:client_leger/models/tournament.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/screens/floating_chat_screen.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/services/room_service.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/services/users_service.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:client_leger/utils/constants/game.dart';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:client_leger/widgets/custom_button.dart';
import 'package:client_leger/widgets/app_sidebar.dart';
import 'package:client_leger/widgets/input_field.dart';
import 'package:flutter/material.dart';
import 'package:form_validator/form_validator.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
import 'package:sidebarx/sidebarx.dart';

class GameStartScreen extends StatelessWidget {
  GameStartScreen({super.key});

  final sideBarController =
      SidebarXController(selectedIndex: 0, extended: true);
  final String gameMode = Get.arguments;
  final WebsocketService _websocketService = Get.find();
  final GameService _gameService = Get.find();
  final RoomService _roomService = Get.find();
  final SettingsService _settingsService = Get.find();
  final UsersService _usersService = Get.find();

  final RxList<RxBool> _selectedGameType = <RxBool>[true.obs, false.obs, false.obs].obs;
  final RxList<RxBool> _selectedTournamentType = <RxBool>[true.obs, false.obs].obs;
  final RxBool _isProtected = false.obs;
  final RxBool selectedChatRoom = false.obs;

  final gamePasswordController = TextEditingController();
  final joinGamePasswordController = TextEditingController();

  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final GlobalKey<FormState> _passwordFormKey = GlobalKey<FormState>();

  final FocusNode joinGamePasswordInputFocusNode = FocusNode();

  late bool _isPrivate = false;

  @override
  Widget build(BuildContext context) {
    return Builder(
        builder: (BuildContext context) => Scaffold(
              resizeToAvoidBottomInset: true,
              drawerScrimColor: Colors.transparent,
              floatingActionButton: FloatingActionButton(
                    onPressed: () {
                      _scaffoldKey.currentState?.openEndDrawer();
                    },
                    backgroundColor: Color.fromARGB(255, 98, 0, 238),
                    foregroundColor: Colors.white,
                    autofocus: true,
                    focusElevation: 5,
                    child: const Icon(
                      Icons.question_answer_rounded,
                    ),
                  ),
              key: _scaffoldKey,
              endDrawer: Drawer(child: Obx(() => _buildChatRoomsList())),
              body: Row(
                children: [
                  AppSideBar(controller: sideBarController),
                  Expanded(
                    child: _buildItems(
                      context,
                    ),
                  ),
                ],
              ),
            ));
  }

  Widget _buildItems(BuildContext context) {
    return AnimatedBuilder(
        animation: sideBarController,
        builder: (context, child) {
          return SingleChildScrollView(
            child: Center(
                child: SizedBox(
              height: 600,
              width: 600,
              child: Column(
                children: [
                  Image(
                    image: _settingsService.getLogo(),
                  ),
                  const Gap(20),
                  Text('Choisissez une option de jeu',
                      style: Theme.of(context).textTheme.headline6),
                  Gap(Get.height / 8),
                  SizedBox(
                    width: 230,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        _showCreateGameOptionsDialog();
                        // _websocketService.createGameRoom();
                        // Get.toNamed(
                        //     Routes.HOME + Routes.GAME_START + Routes.LOBBY);
                      },
                      icon: const Padding(
                        padding: EdgeInsets.all(8.0),
                        child: Icon(
                          Icons.create,
                          size: 50,
                        ),
                      ),
                      label: Text(
                          '${gameMode == 'tournoi' ? 'Créer un tournoi' : 'Créer une partie'}'), // <-- Text
                    ),
                  ),
                  const Gap(40),
                  SizedBox(
                    width: 230,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        if (gameMode == 'tournoi') {
                          // _showPainter();
                          _showJoinableGamesDialog(context, true);
                        } else {
                          _showJoinableGamesDialog(context, false);
                        }
                      },
                      icon: const Padding(
                        padding: EdgeInsets.all(8.0),
                        child: Icon(
                          // <-- Icon
                          Icons.format_list_numbered_sharp,
                          size: 50,
                        ),
                      ),
                      label: Text(
                          '${gameMode == 'tournoi' ? 'Rejoindre un tournoi' : 'Rejoindre une partie'}'), // <-- Text
                    ),
                  ),
                  const Gap(40),
                  gameMode != 'tournoi'
                      ? SizedBox(
                          width: 230,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              if (gameMode == 'tournoi') {
                                _showPainter();
                              } else {
                                _showObservableGamesDialog(context);
                              }
                            },
                            icon: const Padding(
                              padding: EdgeInsets.all(8.0),
                              child: Icon(
                                // <-- Icon
                                MdiIcons.eye,
                                size: 50,
                              ),
                            ),
                            label:
                                const Text('Observer une partie'), // <-- Text
                          ),
                        )
                      : const SizedBox(),
                ],
              ),
            )),
          );
        });
  }

  void _showObservableGamesDialog(BuildContext context) {
    Get.dialog(
      Dialog(
        child: SizedBox(
          height: 500,
          width: 600,
          child: DefaultTabController(
            length: 2,
            child: Scaffold(
              appBar: AppBar(
                elevation: 0,
                toolbarHeight: 0,
                bottom: const TabBar(
                  tabs: [
                    Tab(text: 'Parties publiques'),
                    Tab(text: 'Parties privées'),
                  ],
                ),
              ),
              body: TabBarView(
                children: [_buildObservableGamesTab(false), _buildObservableGamesTab(true)],
              ),
            ),
          ),
        ),
      ),
    );
  }

  RxList<bool> _getListValues(bool isTournament) {
    if (isTournament) {
      return RxList.from(_selectedTournamentType.value.map((e) => e.value));
    } else {
      return RxList.from(_selectedGameType.value.map((e) => e.value));
    }
  }
  
  void _showCreateGameOptionsDialog() {
    Get.dialog(
        Dialog(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              // height: double.infinity,
              width: 400,
              child: Obx(() => Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Type de la partie',
                          style: Get.textTheme.headlineSmall),
                        const Gap(20),
                        ToggleButtons(
                              onPressed: (int index) {
                                gameMode == 'tournoi'
                                  ? _handleToggleButtonOnPress(_selectedTournamentType, index)
                                  : _handleToggleButtonOnPress(_selectedGameType, index);
                              },
                              isSelected: _getListValues(gameMode == 'tournoi').value,
                              borderRadius: const BorderRadius.all(Radius.circular(8)),
                              selectedBorderColor: Color.fromARGB(255, 107, 12, 241),
                              selectedColor: Colors.white,
                              fillColor: Color.fromARGB(255, 98, 0, 238),
                              color: Colors.black,
                              constraints: const BoxConstraints(
                                minHeight: 40.0,
                                minWidth: 80.0,
                              ),
                              children: _buildGameTypeToggleButtons()
                            ),
                        _showProtectedGamePassword(),
                      ],
                  ),
              ),
            ),
          ),
        ),
      barrierDismissible: false,
    );
  }

  void _handleToggleButtonOnPress(RxList<RxBool> _selectedType, int index) {
    for (int i = 0; i < _getListValues(gameMode == 'tournoi').value.length; i++) {
      _selectedType.value[i].value = i == index;
    }
    if (gameMode == 'tournoi') {
      _isProtected.value = _selectedType.value[1].value;
      _isPrivate = _selectedType.value[2].value;
    } else {
      _isPrivate = _selectedType.value[1].value;
    }
  }

  List<Widget> _buildGameTypeToggleButtons() {
    if (gameMode == 'tournoi') {
      return const [
        Padding(
            padding: EdgeInsets.all(16.0),
            child: Text('Publique')
        ),
        Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text('Privée')
        )
      ];
    } else {
      return const [
        Padding(
            padding: EdgeInsets.all(16.0),
            child: Text('Publique')
        ),
        Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text('Protégée')
        ),
        Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text('Privée')
        )
      ];
    }
  }

  Widget _showProtectedGamePassword() {
      return Column(
          children: [
            Container(
              margin: const EdgeInsets.all(8),
              padding: const EdgeInsets.all(8),
              child: Form(
                key: _passwordFormKey,
                child: Column(
                  children: [
                    _buildPasswordInputField(),
                    Gap(20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        TextButton(
                            style: TextButton.styleFrom(
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    side: const BorderSide(color: Colors.black))),
                            onPressed: () {
                              DialogHelper.hideLoading();
                              if (_isProtected.value && _passwordFormKey.currentState!.validate()) {
                                gameMode == 'tournoi'
                                    ? _websocketService.createTournament()
                                    : _websocketService.createGameRoom(password: gamePasswordController.text);
                              } else {
                                gameMode == 'tournoi'
                                    ? _websocketService.createTournament(isPrivate: _isPrivate)
                                    : _websocketService.createGameRoom(isPrivate: _isPrivate);
                              }
                                // Get.toNamed(
                                //     Routes.HOME + Routes.GAME_START + Routes.LOBBY);
                            },
                            child: const Text('Confirmer')),
                        TextButton(
                            style: TextButton.styleFrom(
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    side: const BorderSide(color: Colors.black))),
                            onPressed: () {
                              DialogHelper.hideLoading();
                              gamePasswordController.text = '';
                            },
                            child: const Text('Annuler')),
                      ],
                    ),
                ]),
              ),
          ),
        ]);
  }

  Widget _buildPasswordInputField() {
    if (_isProtected.value && gameMode != 'tournoi') {
      return InputField(
          controller: gamePasswordController,
          keyboardType: TextInputType.text,
          placeholder: 'Entrez le mot de passe',
          validator: ValidationBuilder(
              requiredMessage:
              'Le champ ne peut pas être vide')
              .build());
    } else {
      return const SizedBox(height: 0, width: 0);
    }
  }

  void _showJoinableGamesDialog(BuildContext context, bool isTournament) {
    Get.dialog(
      Dialog(
        child: SizedBox(
          height: 500,
          width: 600,
          child: DefaultTabController(
            length: 2,
            child: Scaffold(
              appBar: AppBar(
                elevation: 0,
                toolbarHeight: 0,
                bottom: TabBar(
                  tabs: [
                    Tab(text: isTournament ? 'Tournois publiques' : 'Parties publiques'),
                    Tab(text: isTournament ? 'Tournois privés' : 'Parties publiques'),
                  ],
                ),
              ),
              body: TabBarView(
                children: [_buildJoinableGamesTab(false, isTournament), _buildJoinableGamesTab(true, isTournament)],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildObservableGamesTab(bool isPrivateGames) {
    return Column(
      children: [
        Obx(
              () => Expanded(
              child: SingleChildScrollView(
                child: DataTable(
                  columns: const <DataColumn>[
                    DataColumn(
                      label: Expanded(
                        child: Text(
                          'Créateur',
                        ),
                      ),
                    ),
                    DataColumn(
                      label: Expanded(
                        child: Text(
                          'Joueurs',
                        ),
                      ),
                    ),
                    DataColumn(
                      label: Expanded(
                        child: Text(
                          'Type',
                        ),
                      ),
                    ),
                    DataColumn(
                      label: Expanded(
                        child: Text(
                          'Rejoindre',
                        ),
                      ),
                    ),
                  ],
                  rows: _createObservableGameRows(isPrivateGames),
                ),
              )),
        ),
        const Gap(10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextButton(
                style: TextButton.styleFrom(
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: Colors.black))),
                onPressed: () {
                  DialogHelper.hideLoading();
                },
                child: const Text('Annuler')),
          ],
        ),
        const Gap(10),
      ],
    );
  }

  Widget _buildJoinableGamesTab(bool isPrivateGames, bool isTournament) {
    return Column(
      children: [
        Obx(
          () => Expanded(
              child: SingleChildScrollView(
            child: DataTable(
              columns: const <DataColumn>[
                DataColumn(
                  label: Expanded(
                    child: Text(
                      'Créateur',
                    ),
                  ),
                ),
                DataColumn(
                  label: Expanded(
                    child: Text(
                        'Joueurs',
                    ),
                  ),
                ),
                DataColumn(
                  label: Expanded(
                    child: Text(
                      'Type',
                    ),
                  ),
                ),
                DataColumn(
                  label: Expanded(
                    child: Text(
                      'Rejoindre',
                    ),
                  ),
                ),
              ],
              rows: _createJoinableGameRows(isPrivateGames, isTournament),
            ),
          )),
        ),
        const Gap(10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextButton(
                style: TextButton.styleFrom(
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: Colors.black))),
                onPressed: () {
                  DialogHelper.hideLoading();
                },
                child: const Text('Annuler')),
          ],
        ),
        const Gap(10),
      ],
    );
  }

  List<DataRow> _createObservableGameRows(bool privateGames) {
    if (_gameService.observableGames.value != null) {
      return _gameService.observableGames.value!
          .expand((game) => [
        if (game.isPrivateGame == privateGames)
          DataRow(cells: [
            DataCell(Text(_usersService.getUserUsername(game.creatorId))),
            DataCell(
                Text('${game.userIds.length} / 4')
            ),
            DataCell(
                _buildTypeOfGame(game)
            ),
            DataCell(
              ElevatedButton.icon(
                onPressed: () {
                  _websocketService.joinGameAsObserver(game.id);
                  // Get.toNamed(
                  //     Routes.HOME + Routes.GAME_START + Routes.LOBBY);
                },
                icon: const Icon(
                  // <-- Icon
                  Icons.play_arrow,
                  size: 20,
                ),
                label: const Text('Rejoindre'), // <-- Text
              ),
            ),
          ])
      ])
          .toList();
    }
    return [
      const DataRow(cells: [DataCell(Text('')), DataCell(Text(''))])
    ];
  }

  List<DataRow> _createJoinableGameRows(bool privateGames, bool isTournament) {
    if (isTournament) {
      if (_gameService.joinableTournaments.value != null) {
        return _gameService.joinableTournaments.value!
            .expand((tournament) =>
        [
          if (tournament.isPrivate == privateGames)
            DataRow(cells: [
              DataCell(Text(_usersService.getUserUsername(tournament.creatorId))),
              DataCell(
                  Text('${tournament.userIds.length} / 4')
              ),
              DataCell(
                  _buildTypeOfTournament(tournament)
              ),
              DataCell(
                ElevatedButton.icon(
                  onPressed: () {
                    if (tournament.isPrivate) {
                      _websocketService.joinGame(tournament.id);
                      _showWaitingForCreatorApprovalDialog(tournament.id);
                    }
                    else {
                      _websocketService.joinGame(tournament.id);
                      // Get.toNamed(
                      //     Routes.HOME + Routes.GAME_START + Routes.LOBBY);
                    }
                  },
                  icon: const Icon(
                    // <-- Icon
                    Icons.play_arrow,
                    size: 20,
                  ),
                  label: const Text('Rejoindre'), // <-- Text
                ),
              ),
            ])
        ])
            .toList();
      }
      return [
        const DataRow(cells: [DataCell(Text('')), DataCell(Text(''))])
      ];
    } else {
      if (_gameService.joinableGames.value != null) {
        return _gameService.joinableGames.value!
            .expand((game) =>
        [
          if (game.isPrivateGame == privateGames)
            DataRow(cells: [
              DataCell(Text(_usersService.getUserUsername(game.creatorId))),
              DataCell(
                  Text('${game.userIds.length} / 4')
              ),
              DataCell(
                  _buildTypeOfGame(game)
              ),
              DataCell(
                ElevatedButton.icon(
                  onPressed: () {
                    if (game.isProtected) {
                      _showProtectedGamePasswordDialog(game);
                    } else if (game.isPrivateGame) {
                      _websocketService.joinGame(game.id);
                      _showWaitingForCreatorApprovalDialog(game.id);
                    }
                    else {
                      _websocketService.joinGame(game.id);
                      // Get.toNamed(
                      //     Routes.HOME + Routes.GAME_START + Routes.LOBBY);
                    }
                  },
                  icon: const Icon(
                    // <-- Icon
                    Icons.play_arrow,
                    size: 20,
                  ),
                  label: const Text('Rejoindre'), // <-- Text
                ),
              ),
            ])
        ])
            .toList();
      }
      return [
        const DataRow(cells: [DataCell(Text('')), DataCell(Text(''))])
      ];
    }
  }

  Widget _buildChatRoomsList() {
    if (!selectedChatRoom.value) {
      print("selectedchatroom value");
      print(selectedChatRoom);
      return Column(
        children: [
          Container(
            color: Color.fromARGB(255,98,0,238),
            height: 60,
            width: double.infinity,
            child: const DrawerHeader(
              child: Text(
                'Chats',
                style: TextStyle(
                    fontSize: 20,
                    color: Colors.white
                ),
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
          title: Text(roomName),
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

  Widget _buildTypeOfTournament(Tournament tournament) {
    if (tournament.isPrivate) {
      return Text('Privée');
    } else {
      return Text('Ouverte');
    }
  }

  Widget _buildTypeOfGame(Game game) {
    if (game.isProtected) {
      return Text('Protégée');
    } else if (game.isPrivateGame) {
      return Text('Privée');
    } else {
      return Text('Ouverte');
    }
  }

  void _showWaitingForCreatorApprovalDialog(String gameId) {
    Get.dialog(
      Dialog(
        child: SizedBox(
          height: 225,
          width: 300,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('En attente de la réponse du créateur de la partie',
                    style: Get.textTheme.headlineSmall),
                Gap(20),
                const CircularProgressIndicator(),
                Gap(20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    TextButton(
                        style: TextButton.styleFrom(
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side: const BorderSide(color: Colors.black))),
                        onPressed: () async {
                          final res = await _gameService.revokeJoinGameRequest(gameId);
                        },
                        child: const Text('Annuler')),
                  ],
                ),
              ],
            ),
          ),
        ),
      )
    );
  }

  void _showProtectedGamePasswordDialog(Game game) {
    Get.dialog(
      Dialog(
        child: SizedBox(
          height: 225,
          width: 300,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Cette partie est protégée',
                  style: Get.textTheme.headlineSmall),
                Gap(20),
                TextField(
                  controller: joinGamePasswordController,
                  keyboardType: TextInputType.text,
                  focusNode: joinGamePasswordInputFocusNode,
                  onSubmitted: (_) {
                    // _websocketService.sendMessage();
                    _websocketService.joinGame(game.id, password: joinGamePasswordController.text);
                    joinGamePasswordInputFocusNode.requestFocus();
                  },
                  decoration: const InputDecoration(
                      hintText: "Entrez le mot de passe",
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.all(Radius.circular(8)))),
                ),
                Gap(20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    TextButton(
                        style: TextButton.styleFrom(
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side: const BorderSide(color: Colors.black))),
                        onPressed: () {
                          _websocketService.joinGame(game.id, password: joinGamePasswordController.text);
                        },
                        child: const Text('Confirmer')),
                    TextButton(
                        style: TextButton.styleFrom(
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side: const BorderSide(color: Colors.black))),
                        onPressed: () {
                          DialogHelper.hideLoading();
                          joinGamePasswordController.text = '';
                        },
                        child: const Text('Annuler')),
                  ],
                ),
              ],
            ),
          ),
        ),
      )
    );
  }

// void _showCreateGameDialog(BuildContext context) {
//   Get.dialog(
//     Dialog(
//       child: SizedBox(
//         height: 500,
//         width: 600,
//         child: Column(
//           children: [
//             const Gap(10),
//             Text('Configuration d\'une partie',
//                 style: Theme.of(context).textTheme.headline6),
//             const Gap(10),
//             Expanded(
//                 child: Stepper(
//               type: StepperType.vertical,
//               physics: const ScrollPhysics(),
//               steps: [
//                 Step(
//                   title: const Text('Minuterie'),
//                   content: DropdownButton(
//                     menuMaxHeight: 200,
//                     items: GameConstants.timerOptions
//                         .map<DropdownMenuItem>((Map<String, Object> option) {
//                       return DropdownMenuItem(
//                         value: option['value'],
//                         child: Text(option['name'] as String),
//                       );
//                     }).toList(),
//                     onChanged: (value) {},
//                   ),
//                 ),
//                 Step(
//                   title: const Text('Visibilité'),
//                   content: Column(
//                     children: [],
//                   ),
//                 ),
//                 Step(
//                   title: const Text('Dictionnaire'),
//                   content: Column(
//                     children: [],
//                   ),
//                 ),
//               ],
//             )),
//             const Gap(10),
//             Row(
//               mainAxisAlignment: MainAxisAlignment.center,
//               children: [
//                 TextButton(
//                     style: TextButton.styleFrom(
//                         shape: RoundedRectangleBorder(
//                             borderRadius: BorderRadius.circular(12),
//                             side: const BorderSide(color: Colors.black))),
//                     onPressed: () {},
//                     child: const Text('Confirmer')),
//                 const Gap(10),
//                 TextButton(
//                     style: TextButton.styleFrom(
//                         shape: RoundedRectangleBorder(
//                             borderRadius: BorderRadius.circular(12),
//                             side: const BorderSide(color: Colors.black))),
//                     onPressed: () {
//                       DialogHelper.hideLoading();
//                     },
//                     child: const Text('Annuler')),
//               ],
//             ),
//             const Gap(10),
//           ],
//         ),
//       ),
//     ),
//     barrierDismissible: false,
//   );
// }
  void _showPainter() {
    Get.dialog(
        Dialog(
          child: SizedBox(
            height: 800,
            width: 850,
            child: CustomPaint(
              painter: TournamentPainter(),
              child: Align(
                  alignment: Alignment.topRight,
                  child: IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () {
                      DialogHelper.hideLoading();
                    },
                  )),
            ),
          ),
        ),
        barrierDismissible: false);
  }
}

class TournamentPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    var padding = 100.0;
    var width = 150.0;
    var height = 100.0;
    var offset = width - height;

    var paint = Paint()
      ..color = Get.isDarkMode ? Colors.white : Colors.black
      ..strokeWidth = 5.0
      ..style = PaintingStyle.stroke;

    final textSpan = TextSpan(
        text: 'Progression du tournoi en cours',
        style: Get.textTheme.headline6);
    final TilePainter = TextPainter(
      text: textSpan,
      textDirection: TextDirection.ltr,
    );
    TilePainter.layout(
      minWidth: 0,
      maxWidth: size.width,
    );
    final xCenter = (size.width - TilePainter.width) / 2;
    final yTop = 20.0;
    final titlePos = Offset(xCenter, yTop);
    TilePainter.paint(canvas, titlePos);

    for (int i = 0; i < 4; i++) {
      var rightSideY = padding * (i + 1) + offset * i;
      canvas.drawRect(Rect.fromLTWH(padding, rightSideY, width, height), paint);
      canvas.drawLine(Offset(padding + width, rightSideY + height / 2),
          Offset(padding + width + offset * 2, rightSideY + height / 2), paint);
      if (i.isEven) {
        canvas.drawLine(
            Offset(padding + width + offset * 2, rightSideY + height / 2 - 2.5),
            Offset(padding + width + offset * 2,
                rightSideY + height / 2 + height + offset + 2.5),
            paint);
        canvas.drawLine(
            Offset(
                padding + width + offset * 2, rightSideY + height + offset / 2),
            Offset(
                padding + width + offset * 3, rightSideY + height + offset / 2),
            paint);
      }
    }
    for (int i = 0; i < 2; i++) {
      var rightSideY =
          padding * (i + 1) + offset * i * 4 + height / 2 + offset / 2;
      canvas.drawRect(
          Rect.fromLTWH(
              padding + width + offset * 3, rightSideY, width, height),
          paint);
      canvas.drawLine(
          Offset(padding + width + offset * 3 + width, rightSideY + height / 2),
          Offset(padding + width + offset * 3 + width + offset,
              rightSideY + height / 2),
          paint);
      if (i.isEven) {
        canvas.drawLine(
            Offset(padding + width + offset * 3 + width + offset - 2.5,
                rightSideY + height / 2),
            Offset(padding + width + offset * 3 + width + offset,
                rightSideY + height / 2 + height + offset * 4 + 2.5),
            paint);
        canvas.drawLine(
            Offset(padding + width + offset * 3 + width + offset,
                rightSideY + height + offset * 2),
            Offset(padding + width + offset * 3 + width + offset * 2,
                rightSideY + height + offset * 2),
            paint);
      }
    }

    for (int i = 0; i < 1; i++) {
      var rightSideY = height * 2 + offset * 2 + offset / 2;
      canvas.drawRect(
          Rect.fromLTWH(padding + width + offset * 3 + width + offset * 2,
              rightSideY, width, height),
          paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}
