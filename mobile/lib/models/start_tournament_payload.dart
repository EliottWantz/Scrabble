class StartTournamentPayload {
  String tournamentId;

  StartTournamentPayload({
    required this.tournamentId
  });

  factory StartTournamentPayload.fromJson(Map<dynamic, dynamic> json) => StartTournamentPayload(
      tournamentId: json["tournamentId"]
  );

  Map<String, dynamic> toJson() => {
    "tournamentId": tournamentId
  };
}