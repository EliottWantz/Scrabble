import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get_rx/src/rx_types/rx_types.dart';

class SearchBar extends StatelessWidget {
  SearchBar(RxString input, {
    Key? key,
    // required this.text,
    // required this.onChanged,
    // required this.hintText,
  }) : _input = input,
        super(key: key);

  final RxString _input;
  // final String text;
  // final ValueChanged<String> onChanged;
  // final String hintText;

  final controller = TextEditingController();

  final styleActive = TextStyle(color: Colors.black);
  final styleHint = TextStyle(color: Colors.black54);

  final FocusNode messageInputFocusNode = FocusNode();

  @override
  Widget build(BuildContext context) {
    // final style = widget.text.isEmpty ? styleHint : styleActive;

    return Container(
      margin: const EdgeInsets.all(8),
      padding: const EdgeInsets.all(8),
      child: TextField(
        controller: controller,
        keyboardType: TextInputType.text,
        focusNode: messageInputFocusNode,
        onChanged: (_) {
          _input.value = controller.text;
          messageInputFocusNode.requestFocus();
        },
        onSubmitted: (_) {
          messageInputFocusNode.requestFocus();
        },
        decoration: InputDecoration(
            hintText: "Recherchez",
            suffixIcon: IconButton(
              onPressed: () {
                _input.value = '';
                controller.text = '';
              },
              icon: Icon(Icons.clear),
            ),
            border: OutlineInputBorder(
                borderRadius:
                BorderRadius.all(Radius.circular(8)))
        ),
      ),
    );
  }
}
