import 'package:intl/intl.dart';

class ChatMessagePayload {
  String roomId;
  String message;
  String from;
  String fromId;
  DateTime? timestamp;

  ChatMessagePayload({
    required this.roomId,
    required this.message,
    required this.from,
    required this.fromId,
    this.timestamp
  });

  factory ChatMessagePayload.fromJson(Map<dynamic, dynamic> json) => ChatMessagePayload(
      roomId: json["roomId"],
      message: json["message"],
      from: json["from"],
      fromId: json["fromId"],
      // timestamp: DateFormat("yyyy-dd-mmThh:mm:ss").parse(json["timestamp"], true)
      timestamp: DateTime.parse(json["timestamp"])
  );

  Map<String, dynamic> toJson() => {
    "roomId": roomId,
    "message": message,
    "from": from,
    "fromId": fromId,
    "timestamp": timestamp,
  };
}