import 'dart:async';
import 'package:client_leger/services/storage_service.dart';
import 'package:get/get.dart';
import 'package:get/get_connect/http/src/request/request.dart';

FutureOr<Request> requestInterceptor(request) async {
  StorageService storageService = Get.find();
  var token = storageService.read('token');
  if (token != null) {
    request.headers['Authorization'] = 'Bearer $token';
  }
  return request;
}
