import 'package:get/get.dart';
import 'api_constants.dart';
import 'interceptors/request_interceptor.dart';
import 'interceptors/response_interceptor.dart';

class BaseProvider extends GetConnect {
  @override
  void onInit() {
    httpClient.timeout = const Duration(seconds: 5);
    httpClient.baseUrl = ApiConstants.baseUrl;
    httpClient.addRequestModifier(requestInterceptor);
    httpClient.addResponseModifier(responseInterceptor);
  }
}