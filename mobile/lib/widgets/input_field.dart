import 'package:flutter/material.dart';

class InputField extends StatelessWidget {
  final TextEditingController controller;
  final TextInputType keyboardType;
  final String labelText;
  final String placeholder;
  final double fontSize;
  final bool password;
  final String? Function(String?)? validator;

  InputField({
    required this.controller,
    this.keyboardType = TextInputType.text,
    this.labelText = '',
    this.placeholder = '',
    this.fontSize = 22.0,
    this.password = false,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      decoration: InputDecoration(
        fillColor: Colors.transparent,
        contentPadding: const EdgeInsets.symmetric(vertical: 10.0),
        focusedBorder: const UnderlineInputBorder(
          borderSide: BorderSide(),
        ),
        enabledBorder: const UnderlineInputBorder(
          borderSide: BorderSide(),
        ),
        floatingLabelBehavior: FloatingLabelBehavior.always,
        labelText: labelText,
        labelStyle: TextStyle(
          fontSize: fontSize - 2,
          height: 0.2,
          fontWeight: FontWeight.normal,
        ),
        hintText: placeholder,
        hintStyle: TextStyle(
          fontSize: fontSize,
          fontWeight: FontWeight.normal,
        ),
        filled: true,
        isDense: true,
      ),
      controller: controller,
      style: TextStyle(
        fontSize: fontSize,
        fontWeight: FontWeight.normal,
      ),
      keyboardType: keyboardType,
      obscureText: password,
      autocorrect: false,
      validator: validator,
    );
  }
}
