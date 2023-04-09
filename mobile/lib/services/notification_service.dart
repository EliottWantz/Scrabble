import 'package:client_leger/models/invited_to_game_payload.dart';
import 'package:get/get.dart';

class NotificationService extends GetxService {
  final RxList<InvitedToGamePayload> gameInviteNotifications = <InvitedToGamePayload>[].obs;
}