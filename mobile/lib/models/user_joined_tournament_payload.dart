class UserJoinedTournamentPayload {
  String tournamentId;
  String userId;

  UserJoinedTournamentPayload({required this.tournamentId, required this.userId});

  factory UserJoinedTournamentPayload.fromJson(Map<dynamic, dynamic> json) => UserJoinedTournamentPayload(
      tournamentId: json["tournamentId"],
      userId: json["userId"]
  );

  Map<String, dynamic> toJson() => {
    "tournamentId": tournamentId,
    "userId": userId
  };
}