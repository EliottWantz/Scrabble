class ChatMessage {
  String event;
  String payload;

  ChatMessage({
    required this.event,
    required this.payload
  });

  // factory ChatMessage.fromJson(dynamic json) {
  //   return ChatMessage(json['event'] as String, json['payload'] as String);
  // }
}