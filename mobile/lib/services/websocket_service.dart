import 'dart:convert';

import 'package:client_leger/models/chat_message_payload.dart';
import 'package:client_leger/models/create_room_payload.dart';
import 'package:client_leger/models/events.dart';
import 'package:client_leger/models/requests/chat_message_request.dart';
import 'package:client_leger/models/response/chat_message_response.dart';
import 'package:get/get.dart';
// import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:client_leger/api/api_constants.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:client_leger/services/user_service.dart';

import '../models/requests/create_room_request.dart';

class WebsocketService extends GetxService {
  final UserService userService;

  WebsocketService(
      {required this.userService});

  late WebSocketChannel socket;
  late String roomId;
  late RxList<ChatMessageResponse> messages = <ChatMessageResponse>[].obs;
  late RxString timestamp = ''.obs;
  late RxInt itemCount = 0.obs;

  connect() {
    socket = WebSocketChannel.connect(Uri(
        scheme: ApiConstants.wsScheme,
        host: ApiConstants.wsHost,
        port: ApiConstants.wsPort,
        path: ApiConstants.wsPath,
        queryParameters: { 'id': userService.user.value!.id, 'username': userService.user.value!.username }
    ));
    socket.stream.listen((data) {
      handleData(data);
          // print(data);
          // if (jsonDecode(data)['event'] == 'broadcast') {
          //   handleData(ChatMessageResponse.fromRawJson(data));
          // }
        },
      onError: (error) => print(error),
    );
  }

  // handleData(ChatMessageResponse data) {
    handleData(dynamic data) {
    // print(data.payload!.message);
      print(jsonDecode(data)['event']);
    switch(jsonDecode(data)['event']) {
      case ServerEventJoinedRoom: {
        // roomId = data.payload!.roomId;
        print('event joinedRoom');
      }
      break;
      case 'broadcast': {
        roomId = data.payload!.roomId;
        messages.obs.value.add(data);
        print(messages.value.length);
        itemCount.value = messages.value.length;
        print(itemCount.value);
        print(messages.value);
        print('event broadcast');
      }
      break;
      default: {
        print('no event in package received');
      }
      break;
    }
  }

  createRoom(String roomName, { List<String> userIds = const [] }) {
    final createRoomPayload = CreateRoomPayload(
        roomName: roomName,
        userIds: userIds
    );
    final createRoomRequest = CreateRoomRequest(
      event: ClientEventCreateRoom,
      payload: createRoomPayload
    );
    socket.sink.add(createRoomRequest.toRawJson());
  }

  sendMessage(String event, ChatMessagePayload payload) {
    final chatMessageRequest = ChatMessageRequest(
      event: 'broadcast',
      payload: payload,
    );
    socket.sink.add(chatMessageRequest.toRawJson());
  }
}