import 'package:get/get.dart';

import '../models/room.dart';

class GameService extends GetxService {
  final joinableGames = Rxn<List<Room>>();
}
