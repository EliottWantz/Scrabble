import 'dart:convert';

class ListJoinableGamesRequest {
  ListJoinableGamesRequest({
    required this.event
  });

  String event;

  factory ListJoinableGamesRequest.fromRawJson(String str) =>
      ListJoinableGamesRequest.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ListJoinableGamesRequest.fromJson(Map<String, dynamic> json) => ListJoinableGamesRequest(
      event: json["event"]
  );

  Map<String, dynamic> toJson() => {
    "event": event
  };
}