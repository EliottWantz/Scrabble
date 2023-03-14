import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class Timer extends StatelessWidget {
  Timer ({
    Key? key,
    required this.time
  }) : super(key: key);
  
  final time;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 75,
      height: 45,
      child: Row(
        children: [
          const Icon(
            Icons.timer,
            color: Colors.black,
            size: 12.0,
          ),
          // const Spacer(),
          _buildTimeText(context)
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