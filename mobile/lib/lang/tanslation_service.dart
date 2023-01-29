import 'package:client_leger/lang/app_en.dart';
import 'package:client_leger/lang/app_fr.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';


class TranslationService extends Translations {
  static Locale? get locale => Get.deviceLocale;
  static const fallbackLocale = Locale('fr');
  @override
  Map<String, Map<String, String>> get keys => {
    'app_en': app_en,
    'app_fr':app_fr
  };
}
