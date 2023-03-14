class TimerPayload {
  int timer;

  TimerPayload({
    required this.timer,
  });

  factory TimerPayload.fromJson(Map<String, dynamic> json) => TimerPayload(
      timer: json["timer"]
  );

  Map<String, dynamic> toJson() => {
    "timer": timer
  };
}