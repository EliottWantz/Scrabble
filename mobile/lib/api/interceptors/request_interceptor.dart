import 'dart:async';
import 'package:get/get_connect/http/src/request/request.dart';

FutureOr<Request> requestInterceptor(request) async {
  request.headers['Content-Type'] = 'application/json; charset=UTF-8';
  // request.headers['Authorization'] = 'Bearer $token';
  return request;
}