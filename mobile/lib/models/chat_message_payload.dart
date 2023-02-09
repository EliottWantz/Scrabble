class ChatMessagePayload {
  String roomId;
  String message;
  String from;
  String timestamp;

  ChatMessagePayload({
    required this.roomId,
    required this.message,
    required this.from,
    required this.timestamp
  });

  factory ChatMessagePayload.fromJson(Map<dynamic, dynamic> json) => ChatMessagePayload(
      roomId: json["roomId"],
      message: json["message"],
      from: json["from"],
      timestamp: json["timestamp"]
  );

  Map<String, dynamic> toJson() => {
    "roomId": roomId,
    "message": message,
    "from": from,
    "timestamp": timestamp,
  };
}