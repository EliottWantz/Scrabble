import 'dart:convert';

import 'package:client_leger/models/user.dart';

import '../move_info.dart';

class IndiceResponse {
  IndiceResponse({required this.moves});

  List<MoveInfo> moves;

  factory IndiceResponse.fromRawJson(String str) =>
      IndiceResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory IndiceResponse.fromJson(Map<String, dynamic> json) => IndiceResponse(
    moves: List<MoveInfo>.from((json["moves"] as List).map(
        (game) => MoveInfo.fromJson(game)
    ))
  );

  Map<String, dynamic> toJson() => {
    "moves": moves
  };
}
