import 'package:carousel_slider/carousel_slider.dart';
import 'package:client_leger/services/settings_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

final List<String> imgListFR = [
  'assets/images/BasicFR.jpeg',
  'assets/images/ExchangeFR.jpeg',
  'assets/images/HintFR.jpeg',
  'assets/images/MultiplierFR.jpeg',
  'assets/images/PlayFR.jpeg',
];

final List<String> imgListEN = [
  'assets/images/BasicEN.jpeg',
  'assets/images/ExchangeEN.jpeg',
  'assets/images/HintEN.jpeg',
  'assets/images/MultiplierEN.jpeg',
  'assets/images/PlayEN.jpeg',
];

class RulesScreen extends StatelessWidget {
  RulesScreen({Key? key}) : super(key: key);
  SettingsService settingsService = Get.find();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        minimum: EdgeInsets.all(40),
        child: SizedBox(
          height: 1000,
          child: CarouselSlider(
            options: CarouselOptions(
              aspectRatio: 2.0,
              enlargeCenterPage: true,
              scrollDirection: Axis.vertical,
              autoPlay: true,
            ),
            items: settingsService.currentLangValue.value == 'fr'
                ? imageSlidersFr
                : imageSlidersEn,
          ),
        ),
      ),
    );
  }

  final List<Widget> imageSlidersFr = imgListFR
      .map((item) => Container(
            margin: const EdgeInsets.all(5.0),
            child: ClipRRect(
                borderRadius: const BorderRadius.all(Radius.circular(5.0)),
                child: Stack(
                  children: <Widget>[
                    Image.asset(item, width: 1000.0),
                    Positioned(
                      bottom: 0.0,
                      left: 0.0,
                      right: 0.0,
                      child: Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Color.fromARGB(200, 0, 0, 0),
                              Color.fromARGB(0, 0, 0, 0)
                            ],
                            begin: Alignment.bottomCenter,
                            end: Alignment.topCenter,
                          ),
                        ),
                        padding: const EdgeInsets.symmetric(
                            vertical: 10.0, horizontal: 20.0),
                      ),
                    ),
                  ],
                )),
          ))
      .toList();

  final List<Widget> imageSlidersEn = imgListEN
      .map((item) => Container(
            margin: const EdgeInsets.all(5.0),
            child: ClipRRect(
                borderRadius: const BorderRadius.all(Radius.circular(5.0)),
                child: Stack(
                  children: <Widget>[
                    Image.asset(item, width: 1000.0),
                    Positioned(
                      bottom: 0.0,
                      left: 0.0,
                      right: 0.0,
                      child: Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Color.fromARGB(200, 0, 0, 0),
                              Color.fromARGB(0, 0, 0, 0)
                            ],
                            begin: Alignment.bottomCenter,
                            end: Alignment.topCenter,
                          ),
                        ),
                        padding: const EdgeInsets.symmetric(
                            vertical: 10.0, horizontal: 20.0),
                      ),
                    ),
                  ],
                )),
          ))
      .toList();
}
