class ErrorPayload {
  String error;

  ErrorPayload({required this.error});

  factory ErrorPayload.fromJson(Map<String, dynamic> json) =>
      ErrorPayload(error: json["error"]);

  Map<String, dynamic> toJson() => {
    "error": error,
  };
}
