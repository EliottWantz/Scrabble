import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:get/get.dart';

class UserService extends GetxService {
  final user = Rxn<User>();
}
