import 'dart:async';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:get/get_connect/http/src/request/request.dart';
import 'package:get/get_connect/http/src/response/response.dart';

FutureOr<dynamic> responseInterceptor(
    Request request, Response response) async {
  if (response.statusCode != (200 | 201)) {
    DialogHelper.showErrorDialog(description: 'Une erreur est survenue');
    return;
  }
  return response;
}