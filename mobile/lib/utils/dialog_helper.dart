import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

class DialogHelper {
  static void showErrorDialog(
      {String title = 'Error', String? description = 'Something went wrong'}) {
    Get.dialog(
      Dialog(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                title,
                style: Get.textTheme.headline4,
              ),
              const Gap(20),
              Text(
                description ?? '',
                style: Get.textTheme.headline6,
              ),
              const Gap(20),
              ElevatedButton(
                onPressed: () {
                  if (Get.isDialogOpen!) Get.back();
                },
                child: const Text('Okay'),
              ),
            ],
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }

  static Future<void> showLogoutDialog(Function callback) async {
    Get.dialog(
      Dialog(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Déconnexion',
                style: Get.textTheme.headline4,
              ),
              const Gap(20),
              Text(
                'Êtes-vous sûr de vouloir partir',
                style: Get.textTheme.headline6,
              ),
              const Gap(20),
              SizedBox(
                width: 200,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ElevatedButton(
                      onPressed: () async {
                        await callback();
                      },
                      child: const Text('Oui'),
                    ),
                    const Gap(20),
                    ElevatedButton(
                      onPressed: () {
                        if (Get.isDialogOpen!) Get.back();
                      },
                      child: const Text('Non'),
                    ),
                  ],
                ),
              )
            ],
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }

  static Future<void> showLoading([String? message]) async {
    Get.dialog(
      Dialog(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 8),
              Text(message ?? 'Loading...'),
            ],
          ),
        ),
      ),
      barrierDismissible: false,
    );
    await Future.delayed(const Duration(seconds: 2));
  }

  static void hideLoading() {
    if (Get.isDialogOpen!) Get.back();
  }
}
