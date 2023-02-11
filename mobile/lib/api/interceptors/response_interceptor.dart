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
    case 401:
      DialogHelper.showErrorDialog(
          title: 'Erreur 401',
          description: 'Erreur dans la saisie du mot de passe');
      break;
    case 409:
      DialogHelper.showErrorDialog(
          title: 'Erreur 409',
          description: 'Un autre utilisateur est déja connecté sur le compte');
      break;
    default:
      DialogHelper.showErrorDialog(
          title: 'Erreur ${response.statusCode}',
          description: '${response.statusText}');
  }
  return;
}
