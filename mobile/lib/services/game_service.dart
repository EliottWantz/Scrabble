import 'package:get/get.dart';

import '../models/room.dart';

class GameService extends GetxService {
  RxList<Room> joinableGames = RxList<Room>();
}