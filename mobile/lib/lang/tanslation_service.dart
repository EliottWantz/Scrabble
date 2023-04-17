import 'package:client_leger/lang/app_en.dart';
import 'package:client_leger/lang/app_fr.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class TranslationService extends Translations {
  static Locale get locale => const Locale('fr', 'FR');
  static const fallbackLocale = Locale('fr', 'FR');

  @override
  Map<String, Map<String, String>> get keys => {'en_US': en_US, 'fr_FR': fr_FR};
}
