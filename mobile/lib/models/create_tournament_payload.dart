class CreateTournamentPayload {
  bool isPrivate;
  List<String> withUserIds;

  CreateTournamentPayload({
    required this.isPrivate,
    required this.withUserIds
  });

  factory CreateTournamentPayload.fromJson(Map<String, dynamic> json) => CreateTournamentPayload(
      isPrivate: json["isPrivate"],
      withUserIds: List<String>.from((json["withUserIds"] as List).map(
              (userId) => json[userId])
      )
  );

  Map<String, dynamic> toJson() => {
    "isPrivate": isPrivate,
    "withUserIds": withUserIds,
  };
}