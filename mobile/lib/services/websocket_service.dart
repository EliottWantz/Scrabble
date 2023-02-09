import 'dart:convert';

import 'package:client_leger/models/response/chat_message_response.dart';
import 'package:get/get.dart';
// import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:client_leger/api/api_constants.dart';
import 'package:get_storage/get_storage.dart';
import 'package:intl/intl.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;

class WebsocketService extends GetxService {
  late WebSocketChannel socket;
  late String roomId;
  late String username;
  late RxList<ChatMessageResponse> messages = <ChatMessageResponse>[].obs;
  late RxString timestamp = ''.obs;
  late RxInt itemCount = 0.obs;

  connect(String username) {
    socket = WebSocketChannel.connect(Uri(
        scheme: ApiConstants.wsScheme,
        host: ApiConstants.wsHost,
        port: ApiConstants.wsPort,
        path: ApiConstants.wsPath,
        queryParameters: { 'id': username }
    ));
    username = username;
    // final message = {'event': 'broadcast','payload': 'hello'};
    // print(jsonEncode(message));
    socket.stream.listen(
          (data) {
        print(data);
        if (jsonDecode(data)['event'] == 'broadcast') {
          handleData(ChatMessageResponse.fromRawJson(data));
        }
        // handleData(data);
          },
      onError: (error) => print(error),
    );
  }

  handleData(ChatMessageResponse data) {
    // final decodedData = jsonDecode(data);
    print(data.payload!.message);

    switch(data.event) {
      // case 'joinedGlobalRoom': {
      //   roomId = data.payload!.roomId;
      //   print('event joinedGlobalRoom');
      // }
      // break;
      case 'broadcast': {
        roomId = data.payload!.roomId;
        messages.obs.value.add(data);
        // final DateTime timestamp = decodedData['payload']['timestamp'];
        final parsedTimestamp = DateTime.parse(data.payload!.timestamp);
        timestamp.value = DateFormat.Hms().format(parsedTimestamp);
        print(messages.value.length);
        itemCount.value = messages.value.length;
        print(itemCount.value);
        // print(decodedData['payload']['timestamp']);
        // print(decodedData['payload']['message'].runtimeType);
        print(messages.value);
        print('event broadcast');
      }
      break;
      // case '': {
      //   roomId = decodedData['payload']['roomId'];
      //   print('event empty');
      // }
      // break;
      default: {
        print('no event in package received');
      }
      break;
    }
  }

  sendMessage(String event, String payload) {
    // final timestamp = DateFormat('y-M-d H:m:s').format(DateTime.now());
    final message = {
      'event': 'broadcast',
      'payload': {
        'RoomId': 'global',
        'Message': 'hello 2',
        'From': 'test123'
      }
    };
    socket.sink.add(jsonEncode(message));
  }
}