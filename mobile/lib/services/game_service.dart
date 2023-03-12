import 'package:client_leger/models/game_room.dart';
import 'package:get/get.dart';

class GameService extends GetxService {
  final joinableGames = Rxn<List<GameRoom>>();
}
