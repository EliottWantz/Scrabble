class ErrorMessage {
  int code;
  String message;

  ErrorMessage({required this.code, required this.message});

  factory ErrorMessage.fromJson(Map<String, dynamic> json) =>
      ErrorMessage(code: json["code"], message: json["message"]);

  Map<String, dynamic> toJson() => {
        "code": code,
        "message": message,
      };
}
