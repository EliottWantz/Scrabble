import 'dart:convert';

import 'package:client_leger/models/indice_payload.dart';
import 'package:client_leger/models/user.dart';

import '../move_info.dart';

class IndiceResponse {
  IndiceResponse({
    required this.event,
    required this.payload
  });

  String event;
  List<MoveInfo> payload;

  factory IndiceResponse.fromRawJson(String str) =>
      IndiceResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory IndiceResponse.fromJson(Map<String, dynamic> json) => IndiceResponse(
      event: json["event"],
      payload: List<MoveInfo>.from((json["payload"]["moves"] as List).map(
        (move) => MoveInfo.fromJson(move)
    ))
  );

  Map<String, dynamic> toJson() => {
    "event": event,
    "payload": payload
  };
}
