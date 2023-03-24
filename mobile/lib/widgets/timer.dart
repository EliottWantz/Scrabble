import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class Timer extends StatelessWidget {
  Timer({Key? key, required this.time}) : super(key: key);

  int time;
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
                  value: 1 - time / 60,
                  strokeWidth: 8,
                  valueColor: const AlwaysStoppedAnimation(
                      Color.fromARGB(255, 255, 255, 255)),
                  backgroundColor: Color.fromARGB(255, 27, 53, 94),
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
    if (time.toString().length > 2) {
      return Text(time.toString().substring(0, 2));
    }
    if (time.toString().length == 10) {
      return Text(time.toString().substring(0));
    }
    return Text('00');
  }
}
