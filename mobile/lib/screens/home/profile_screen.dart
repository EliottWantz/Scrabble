import 'dart:math';
import 'package:client_leger/screens/floating_chat_screen.dart';
import 'package:client_leger/services/room_service.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/models/avatar.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/widgets/profile_avatar.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:intl/intl.dart';

class ProfileScreen extends StatelessWidget {
  ProfileScreen({Key? key}) : super(key: key);

  final UserService userService = Get.find();
  final ApiRepository apiRepository = Get.find();
  final RoomService _roomService = Get.find();
  final montreal = tz.getLocation('America/Montreal');

  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  RxBool selectedChatRoom = false.obs;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      drawerScrimColor: Colors.transparent,
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _scaffoldKey.currentState?.openEndDrawer();
        },
        backgroundColor: Color.fromARGB(255,98,0,238),
        foregroundColor: Colors.white,
        autofocus: true,
        focusElevation: 5,
        child: const Icon(
          Icons.question_answer_rounded,
        ),
      ),
      key: _scaffoldKey,
      endDrawer: Drawer(child: Obx(() => _buildChatRoomsList())),
      body: DefaultTabController(
        length: 3,
        child: Scaffold(
          appBar: AppBar(
            elevation: 0,
            toolbarHeight: 0,
            bottom: const TabBar(
              tabs: [
                Tab(text: 'Profil utilisateur', icon: Icon(Icons.person)),
                Tab(text: 'Historique des parties', icon: Icon(Icons.list_alt)),
                Tab(
                    text: 'Activité de l\'utilisateur',
                    icon: Icon(Icons.access_time)),
              ],
            ),
          ),
          body: TabBarView(
            children: [
              _buildUserProfileTab(),
              _buildGameHistoryTab(),
              _buildUserActivityTab(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUserProfileTab() {
    return FutureBuilder<User?>(
        future: apiRepository.user(),
        builder: (BuildContext context, AsyncSnapshot<User?> snapshot) {
          switch (snapshot.connectionState) {
            case ConnectionState.waiting:
              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    CircularProgressIndicator(),
                    Gap(8),
                    Text('Collecte des données'),
                  ],
                ),
              );
            default:
              if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}');
              } else {
                final user = snapshot.data!;
                return Column(
                  children: [
                    const Gap(20),
                    Obx(() => CircleAvatar(
                          maxRadius: 100,
                          backgroundColor: Colors.transparent,
                          backgroundImage:
                              NetworkImage(userService.user.value!.avatar.url),
                        )),
                    const Gap(20),
                    Center(
                      child: Text(
                        userService.user.value!.username,
                        style: Get.context!.textTheme.headline6,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Center(
                      child: Text(
                        userService.user.value!.email,
                        style: Get.context!.textTheme.headline5,
                      ),
                    ),
                    const Gap(50),
                    Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.format_list_numbered),
                            const Gap(5),
                            Text(
                              'Nombre de parties jouées : ${user.summary.userStats?.nbGamesPlayed ?? '--'}',
                              style: Get.context!.textTheme.button,
                            )
                          ],
                        ),
                        const Gap(20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.check_circle_sharp),
                            const Gap(5),
                            Text(
                                'Nombre de parties gagnées : ${user.summary.userStats?.nbGamesWon ?? '--'}',
                                style: Get.context!.textTheme.button)
                          ],
                        ),
                        const Gap(20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.scoreboard_sharp),
                            const Gap(5),
                            Text(
                                'Moyenne de points par partie : ${user.summary.userStats?.averagePointsPerGame ?? '--'}',
                                style: Get.context!.textTheme.button)
                          ],
                        ),
                        const Gap(20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.timelapse),
                            const Gap(5),
                            Text(
                                'Moyenne de temps de jeu : ${user.summary.userStats!.averageTimePlayed != null ? user.summary.userStats!.averageTimePlayed! ~/ pow(10, 5) : '0'} min',
                                style: Get.context!.textTheme.button)
                          ],
                        )
                      ],
                    )
                  ],
                );
              }
          }
        });
  }

  Widget _buildUserActivityTab() {
    return FutureBuilder<User?>(
        future: apiRepository.user(),
        builder: (BuildContext context, AsyncSnapshot<User?> snapshot) {
          switch (snapshot.connectionState) {
            case ConnectionState.waiting:
              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    CircularProgressIndicator(),
                    Gap(8),
                    Text('Collecte des données'),
                  ],
                ),
              );
            default:
              if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}');
              } else {
                final user = snapshot.data!;
                return user.summary.networkLogs!.isNotEmpty
                    ? ListView(children: [
                        DataTable(
                          columns: _createColumns(),
                          rows: _createRowsActivity(user),
                        ),
                      ])
                    : Center(
                        child: Text(
                          'Aucune données disponible',
                          style: Get.context!.textTheme.headline6,
                        ),
                      );
              }
          }
        });
  }

  List<DataColumn> _createColumns() {
    return [
      const DataColumn(label: Text('Type de l\'évènement')),
      const DataColumn(label: Text('Date')),
      const DataColumn(label: Text('Heure')),
    ];
  }

  List<DataRow> _createRowsActivity(User user) {
    return [
      for (final networkLogs in user.summary.networkLogs!.reversed)
        DataRow(cells: [DataCell(Text(networkLogs.eventType.toLowerCase() == 'login'
              ? 'Connexion'
              : 'Déconnexion')),
          DataCell(Text(DateFormat('yyyy-MM-dd').format(tz.TZDateTime.from(
              DateTime.fromMillisecondsSinceEpoch(networkLogs.eventTime),
              montreal)))),
          DataCell(Text(DateFormat('jms').format(tz.TZDateTime.from(
              DateTime.fromMillisecondsSinceEpoch(networkLogs.eventTime),
              montreal)))),
        ]),
    ];
  }

  Widget _buildGameHistoryTab() {
    return FutureBuilder<User?>(
        future: apiRepository.user(),
        builder: (BuildContext context, AsyncSnapshot<User?> snapshot) {
          switch (snapshot.connectionState) {
            case ConnectionState.waiting:
              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    CircularProgressIndicator(),
                    Gap(8),
                    Text('Collecte des données'),
                  ],
                ),
              );
            default:
              if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}');
              } else {
                final user = snapshot.data!;
                return user.summary.gamesStats!.isNotEmpty
                    ? ListView(children: [
                        DataTable(
                          columns: _createColumns(),
                          rows: _createRowsGame(user),
                        ),
                      ])
                    : Center(
                        child: Text(
                          'Aucune données disponible',
                          style: Get.context!.textTheme.headline6,
                        ),
                      );
              }
          }
        });
  }

  List<DataRow> _createRowsGame(User user) {
    return [
      for (final gameStats in user.summary.gamesStats!.reversed)
        DataRow(cells: [
          DataCell(Text(
              'Partie ${gameStats.gameWon != null ? 'gagnée' : 'perdue'}')),
          DataCell(Text(DateFormat('yyyy-MM-dd').format(tz.TZDateTime.from(
              DateTime.fromMillisecondsSinceEpoch(gameStats.gameEndTime),
              montreal)))),
          DataCell(Text(DateFormat('jms').format(tz.TZDateTime.from(
              DateTime.fromMillisecondsSinceEpoch(gameStats.gameEndTime),
              montreal)))),
        ]),
    ];
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
}
