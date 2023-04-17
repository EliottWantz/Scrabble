class LeaveTournamentPayload {
  String tournamentId;

  LeaveTournamentPayload({required this.tournamentId});

  factory LeaveTournamentPayload.fromJson(Map<String, dynamic> json) => LeaveTournamentPayload(
      tournamentId: json["tournamentId"]
  );

  Map<String, dynamic> toJson() => {
    "tournamentId": tournamentId
  };
}