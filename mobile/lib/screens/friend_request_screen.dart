import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class FriendRequestScreen extends StatelessWidget {
  FriendRequestScreen({Key? key}) : super(key: key);

  final friendRequestTextInputController = TextEditingController();
  final FocusNode messageInputFocusNode = FocusNode();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Align(
          alignment: Alignment.topLeft,
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Text(
                'AJOUTER UN AMI',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 30
                )
            ),
          )
        ),
        const Align(
          alignment: Alignment.topLeft,
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Text(
                "Vous pouvez ajouter un ami avec leur nom d'utilisateur sur Scabble.",
              style: TextStyle(
                fontSize: 20
              ),
            ),
          )
        ),
        Align(
          alignment: Alignment.topLeft,
          child: Container(
            margin: const EdgeInsets.all(8),
            padding: const EdgeInsets.all(8),
            child: TextField(
              controller: friendRequestTextInputController,
              keyboardType: TextInputType.text,
              focusNode: messageInputFocusNode,
              onSubmitted: (_) {
                // controller.sendMessage();
                // messageInputFocusNode.requestFocus();
              },
              decoration: const InputDecoration(
                  hintText: "Entrez un nom d'utilisateur",
                  border: OutlineInputBorder(
                      borderRadius:
                      BorderRadius.all(Radius.circular(8)))
              ),
            ),
          ),
        )
      ],
    );
  }
}