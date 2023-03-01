import 'dart:async';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:get/get_connect/http/src/request/request.dart';
import 'package:get/get_connect/http/src/response/response.dart';

FutureOr<dynamic> responseInterceptor(
    Request request, Response response) async {
  DialogHelper.hideLoading();
  if (response.statusCode! >= 400) {
    handleErrorStatus(response);
    throw Exception('${response.statusText}');
  }
  return response;
}

void handleErrorStatus(Response response) {
  switch (response.statusCode) {
    default:
      DialogHelper.showErrorDialog(
          title: 'Erreur ${response.statusCode}',
          description: response.body.toString());
  }
  return;
}
