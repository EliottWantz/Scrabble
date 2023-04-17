import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class Timer extends StatelessWidget {
  Timer({Key? key, required this.time}) : super(key: key);

  num time = 0;
  final size = 130.0;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: size,
      width: size,
      child: Stack(
        fit: StackFit.loose,
        children: [
          Center(
            child: SizedBox(
                width: size,
                height: size,
                child: CircularProgressIndicator(
                  value: 1 - (time / pow(10, 9)) / 60,
                  strokeWidth: 8,
                  valueColor: const AlwaysStoppedAnimation(
                      Colors.red),
                  backgroundColor: const Color.fromARGB(255, 27, 53, 94),
                )),
          ),
          Center(
            child: _buildTimeText(context),
          )
        ],
      ),
    );
  }

  Widget _buildTimeText(BuildContext context) {
    int sec = ((time / pow(10, 9)) % 60).toInt();
    int min = ((time / pow(10, 9)) / 60).floor();
    String minute = min.toString().length <= 1 ? "0$min" : "$min";
    String second = sec.toString().length <= 1 ? "0$sec" : "$sec";
    return Text('$minute : $second',
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20));
  }
}
