import 'dart:convert';

import 'package:client_leger/models/chat_message.dart';
import 'package:get/get.dart';
// import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:client_leger/api/api_constants.dart';
import 'package:intl/intl.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;

class WebsocketService extends GetxService {
  late WebSocketChannel socket;
  late String roomId;
  late String username;

  connect(String username) {
    socket = WebSocketChannel.connect(Uri(
        scheme: ApiConstants.wsScheme,
        host: ApiConstants.wsHost,
        port: ApiConstants.wsPort,
        path: ApiConstants.wsPath,
        queryParameters: { 'id': username }
    ));
    username = username;
    final message = {'event': 'broadcast','payload': 'hello'};
    print(jsonEncode(message));
    socket.stream.listen(
          (data) {
        print(data);
        handleData(data);
      },
      onError: (error) => print(error),
    );
  }

  handleData(String data) {
    final decodedData = jsonDecode(data);

    switch(decodedData['event']) {
      case 'joinedGlobalRoom': {
        roomId = decodedData['payload']['roomId'];
      }
      break;
      default: {}
      break;
    }
  }

  sendMessage(String event, String payload) {
    // final timestamp = DateFormat('y-M-d H:m:s').format(DateTime.now());
    final message = {
      'event': 'broadcast',
      'payload': {
        'RoomId': roomId,
        'Message': 'hello',
        'From': 'test123'
      }
    };
    socket.sink.add(jsonEncode(message));
  }
}