import 'package:client_leger/models/chat_message.dart';
import 'package:get/get.dart';
// import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:client_leger/api/api_constants.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;

class WebsocketService extends GetxService {
  late WebSocketChannel socket;
  late String room;

  // var channel = WebSocketChannel.connect(wsUrl);

  connect() {
    socket = WebSocketChannel.connect(Uri.parse(ApiConstants.wsUrl));
    // socket.connect();
    // socket.onConnect((_) {
    //   print('Connection established');
    // });
    // socket.onDisconnect((_) => print('Connection Disconnection'));
    // socket.onConnectError((err) => print(err));
    // socket.onError((err) => print(err));
  }

  sendMessage(String data) {
    final message = ChatMessage(data: data);
    socket.sink.add(message);
  }
}