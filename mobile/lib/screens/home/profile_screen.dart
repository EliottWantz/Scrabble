import 'dart:math';
import 'package:client_leger/screens/floating_chat_screen.dart';
import 'package:client_leger/services/room_service.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
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
      body: DefaultTabController(
        length: 3,
        child: Scaffold(
          appBar: AppBar(
            elevation: 0,
            toolbarHeight: 0,
            bottom: const TabBar(
              tabs: [
                Tab(text: 'profile-screen.user-profile'.tr, icon: Icon(Icons.person)),
                Tab(text: 'profile-screen.history'.tr, icon: Icon(Icons.list_alt)),
                Tab(
                    text: 'profile-screen.user-activity'.tr,
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
                    Text('profile-screen.data-collection'.tr),
                  ],
                ),
              );
            default:
              if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}');
              } else {
                final user = snapshot.data!;
                return SingleChildScrollView(
                  child: Column(
                    children: [
                      const Gap(20),
                      Obx(() => CircleAvatar(
                            maxRadius: 100,
                            backgroundColor: Colors.transparent,
                            backgroundImage: NetworkImage(
                                userService.user.value!.avatar.url),
                          )),
                      const Gap(20),
                      Obx(() => Center(
                            child: Text(
                              userService.user.value!.username,
                              style: Get.context!.textTheme.headline6,
                            ),
                          )),
                      const Gap(10),
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
                                  'profile-screen.nb-games-won'.tr + ' : ${user.summary.userStats?.nbGamesWon ?? '--'}',
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
                                  'profile-screen.mean-points-game'.tr + ' : ${user.summary.userStats?.averagePointsPerGame ?? '--'}',
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
                                  'profile-screen.mean-game-time'.tr + ': ${user.summary.userStats!.averageTimePlayed != null ? user.summary.userStats!.averageTimePlayed! ~/ pow(10, 5) : '0'} min',
                                  style: Get.context!.textTheme.button)
                            ],
                          )
                        ],
                      ),
                      const Gap(100),
                      ElevatedButton.icon(
                        onPressed: () {
                          Get.toNamed(Routes.HOME + Routes.PROFILE_EDIT);
                        },
                        icon: const Padding(
                          padding: EdgeInsets.all(8.0),
                          child: Icon(
                            MdiIcons.accountWrench,
                            size: 40,
                          ),
                        ),
                        label: const Text('profile-screen.modif-profil'.tr),
                      ),
                    ],
                  ),
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
                    Text('profile-screen.data-collection'.tr),
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
                          'profile-screen.no-data'.tr,
                          style: Get.context!.textTheme.headline6,
                        ),
                      );
              }
          }
        });
  }

  List<DataColumn> _createColumns() {
    return [
      const DataColumn(label: Text('profile-page.type-event'.tr)),
      const DataColumn(label: Text('profile-page.date'.tr)),
      const DataColumn(label: Text('profile-page.hour'.tr)),
    ];
  }

  List<DataRow> _createRowsActivity(User user) {
    return [
      for (final networkLogs in user.summary.networkLogs!.reversed)
        DataRow(cells: [
          DataCell(Text(networkLogs.eventType.toLowerCase() == 'login'
              ? 'sidebar-component.connect'.tr
              : 'sidebar-component.disconnect'.tr)),
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
                    Text('profile-screen.data-collection'.tr),
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
                          'profile-screen.no-data'.tr,
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
              'profile-screen.partie'.tr + ' ${gameStats.gameWon != null ? 'profile-screen-won'.tr : 'profile-screen-lost'.tr}')),
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
