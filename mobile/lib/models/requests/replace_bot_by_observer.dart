import 'dart:convert';

class ReplaceBotPayload {
  String gameId;
  String botId;

  ReplaceBotPayload({required this.gameId, required this.botId});

  factory ReplaceBotPayload.fromJson(Map<String, dynamic> json) =>
      ReplaceBotPayload(gameId: json["gameId"], botId: json["botId"]);

  Map<String, dynamic> toJson() => {"gameId": gameId, "botId": botId};
}

class ReplaceBotByObserverRequest {
  ReplaceBotByObserverRequest({required this.event, required this.payload});

  String event;
  ReplaceBotPayload payload;

  factory ReplaceBotByObserverRequest.fromRawJson(String str) =>
      ReplaceBotByObserverRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ReplaceBotByObserverRequest.fromJson(Map<String, dynamic> json) =>
      ReplaceBotByObserverRequest(
          event: json["event"],
          payload: ReplaceBotPayload.fromJson(json["payload"]));

  Map<String, dynamic> toJson() =>
      {"event": event, "payload": payload.toJson()};
}
