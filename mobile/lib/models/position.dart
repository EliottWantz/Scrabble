class Position {
  int row;
  int col;

  Position({required this.row, required this.col});

  factory Position.fromJson(Map<String, dynamic> json) {
    return Position(
      row: json["row"],
      col: json["col"]);
  }

  Map<String, dynamic> toJson() => {
    "row": row,
    "col": col
  };
}