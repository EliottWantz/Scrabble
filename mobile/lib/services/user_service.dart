import 'package:client_leger/models/user.dart';
import 'package:get/get.dart';

class UserService extends GetxService {
  final user = Rxn<User>();
  final pendingRequest = <dynamic>[].obs;
}