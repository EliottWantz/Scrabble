import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final Widget? child;
  final double width;
  final double height;
  final Color? textColor;
  final Function? onPressed;

  const CustomButton({
    Key? key,
    this.text = "",
    this.child,
    this.width = double.infinity,
    this.height = 50.0,
    this.textColor = Colors.black,
    this.onPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed as void Function()?,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
            color: Colors.black12, borderRadius: BorderRadius.circular(20.0)),
        child: Center(
          child: text != ""
              ? Text(
                  text,
                  style: TextStyle(
                    color: textColor,
                  ),
                )
              : child,
        ),
      ),
    );
  }
}
