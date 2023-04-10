class JoinTournamentPayload {
  String tournamentId;
  String? password;

  JoinTournamentPayload({required this.tournamentId, this.password});

  factory JoinTournamentPayload.fromJson(Map<String, dynamic> json) => JoinTournamentPayload(
      tournamentId: json["tournamentId"],
      password: json["password"]
  );

  Map<String, dynamic> toJson() => {
    "tournamentId": tournamentId,
    "password": password
  };
}