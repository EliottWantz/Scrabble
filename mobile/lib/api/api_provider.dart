import 'package:client_leger/models/requests/game_invite_request.dart';
import 'package:client_leger/models/requests/login_request.dart';
import 'package:client_leger/models/requests/logout_request.dart';
import 'package:client_leger/models/user.dart';
import 'package:get/get.dart';
import 'base_provider.dart';

class ApiProvider extends BaseProvider {
  Future<Response> login(String path, LoginRequest data) {
    return post(path, data.toJson());
  }

  Future<Response> signup(String path, FormData data) {
    return post(path, data);
  }

  Future<Response> upload(String path, FormData data) {
    return post(path, data);
  }

  Future<Response> user(String path) {
    return get(path);
  }

  Future<Response> preferences(String path, Map<String, dynamic> data) {
    return patch(path,data);
  }

  Future<Response> avatars(String path) {
    return get(path);
  }

  Future<Response> sendFriendRequest(String path) {
    // dynamic data = {
    //   "headers": requestData
    // };
    return post(path, {});
  }

  Future<Response> acceptFriendRequest(String path) {
    return patch(path, {});
  }

  Future<Response> deleteFriendRequest(String path) {
    return delete(path);
  }

  Future<Response> deleteFriend(String path) {
    return delete(path);
  }

  Future<Response> acceptJoinGameRequest(String path) {
    return post(path, {});
  }

  Future<Response> declineJoinGameRequest(String path) {
    return delete(path);
  }

  Future<Response> revokeJoinGameRequest(String path) {
    return patch(path, {});
  }

  Future<Response> onlineFriends(String path) {
    return get(path);
  }

  Future<Response> gameInvite(String path, GameInviteRequest data) {
    return post(path, data.toJson());
  }
}
