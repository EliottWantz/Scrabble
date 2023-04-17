import 'package:client_leger/controllers/auth_controller.dart';
import 'package:client_leger/controllers/avatar_controller.dart';
import 'package:client_leger/models/avatar.dart';
import 'package:client_leger/services/storage_service.dart';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:client_leger/widgets/app_sidebar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

class AvatarSelectionScreen extends GetView<AvatarController> {
  AvatarSelectionScreen({Key? key}) : super(key: key);
  final StorageService storageService = Get.find();
  final AuthController authController = Get.arguments;

  @override
  Widget build(BuildContext context) {
    return Builder(
        builder: (BuildContext context) => Scaffold(
              body: Row(
                children: [
                  AppSideBar(
                    controller: controller.sideBarController,
                  ),
                  Expanded(
                    child: _buildItems(
                      context,
                    ),
                  ),
                ],
              ),
            ));
  }

  Widget _buildItems(BuildContext context) {
    return FutureBuilder<List<Avatar>?>(
        future: controller.apiRepository.avatars(),
        builder: (BuildContext context, AsyncSnapshot<List<Avatar>?> snapshot) {
          switch (snapshot.connectionState) {
            case ConnectionState.waiting:
              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const CircularProgressIndicator(),
                    const Gap(8),
                    Text('avatar-fetching'.tr),
                  ],
                ),
              );
            default:
              if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}');
              } else {
                if (snapshot.data == null) return const SizedBox();
                final avatars = snapshot.data!;
                return SafeArea(
                  minimum: const EdgeInsets.symmetric(horizontal: 40.0),
                  child: Center(
                    child: SizedBox(
                      width: 400,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('avatar-selection-component.title'.tr,
                              style: Theme.of(context).textTheme.headline6),
                          const Gap(8),
                          Text(
                            'avatar-selection-component.text'.tr,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          const Gap(50),
                          Obx(() => CircleAvatar(
                                maxRadius: 60,
                                backgroundColor: Colors.transparent,
                                backgroundImage:
                                    controller.getAvatarToDisplay(avatars),
                              )),
                          const Gap(50),
                          ElevatedButton.icon(
                            onPressed: () {
                              _showAvatarOptionsDialog(context, avatars);
                            },
                            icon: const Icon(
                              Icons.perm_identity_sharp,
                              size: 50,
                            ),
                            label: Text(
                                'avatar-selection-component.bouton-defaults'
                                    .tr),
                          ),
                          const Gap(20),
                          Text(
                            'avatar-selection-component.or'.tr,
                            style: Theme.of(context).textTheme.headline6,
                          ),
                          const Gap(20),
                          ElevatedButton.icon(
                            onPressed: () async {
                              await controller.onTakePicture();
                            },
                            icon: const Icon(
                              Icons.camera_alt,
                              size: 50,
                            ),
                            label:
                                Text('avatar-selection-component.picture'.tr),
                          ),
                          const Gap(20),
                          Text(
                            'avatar-selection-component.or'.tr,
                            style: Theme.of(context).textTheme.headline6,
                          ),
                          const Gap(20),
                          ElevatedButton.icon(
                            onPressed: () {
                              _showAvatarStepper();
                            },
                            icon: const Icon(
                              Icons.dashboard_customize,
                              size: 50,
                            ),
                            label: Text('customize-avatar-component.title'.tr),
                          ),
                          const Gap(80),
                          ElevatedButton.icon(
                            onPressed: () async {
                              await authController.onRegister(avatars,
                                  avatarCustomizedUrl:
                                      controller.isAvatarCustomizable.value
                                          ? controller.onGenerateAvatar()
                                          : null);
                            },
                            icon: const Icon(
                              Icons.app_registration,
                              size: 50,
                            ),
                            label: Text('authRegisterBtn'.tr),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }
          }
        });
  }

  void _showAvatarStepper() {
    Get.dialog(
        Dialog(
          child: SizedBox(
              height: 600,
              width: 600,
              child: Obx(() => Stepper(
                    type: StepperType.vertical,
                    currentStep: controller.currentStep.value,
                    physics: const ScrollPhysics(),
                    onStepContinue: () {
                      controller.currentStep.value < _steps().length
                          ? controller.currentStep.value += 1
                          : null;
                    },
                    onStepCancel: () {
                      controller.currentStep.value > 0
                          ? controller.currentStep.value -= 1
                          : null;
                    },
                    controlsBuilder:
                        (BuildContext context, ControlsDetails controls) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 16.0),
                        child: Row(
                          children: [
                            controller.currentStep.value == _steps().length - 1
                                ? ElevatedButton(
                                    onPressed: () {
                                      DialogHelper.hideLoading();
                                      authController
                                          .avatarService.isAvatar.value = true;
                                      controller.isAvatarCustomizable.value =
                                          true;
                                    },
                                    child: Text(
                                        'customize-avatar-component.generate'
                                            .tr),
                                  )
                                : ElevatedButton(
                                    onPressed: controls.onStepContinue,
                                    child: Text(
                                        'customize-avatar-component.next'.tr),
                                  ),
                            if (controller.currentStep != 0)
                              TextButton(
                                onPressed: controls.onStepCancel,
                                child: Text(
                                  'customize-avatar-component.back'.tr,
                                  style: TextStyle(color: Colors.grey),
                                ),
                              ),
                          ],
                        ),
                      );
                    },
                    steps: _steps(),
                  ))),
        ),
        barrierDismissible: false);
  }

  void _showAvatarOptionsDialog(BuildContext context, List<Avatar> avatars) {
    Get.dialog(
      Dialog(
        child: SizedBox(
          height: 500,
          width: 600,
          child: Column(
            children: [
              const Gap(10),
              Text('default-avatar-selection-component.title'.tr,
                  style: Theme.of(context).textTheme.headline6),
              const Gap(10),
              Expanded(
                child: GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      mainAxisSpacing: 20,
                      crossAxisSpacing: 20,
                      crossAxisCount: 3,
                      childAspectRatio: 1,
                    ),
                    shrinkWrap: false,
                    itemCount: avatars.length,
                    scrollDirection: Axis.vertical,
                    itemBuilder: (BuildContext context, int index) {
                      return Obx(
                        () => InkWell(
                          onTap: () {
                            controller.avatarService.currentAvatarIndex.value =
                                index;
                          },
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(20),
                              border: controller.avatarService
                                          .currentAvatarIndex.value ==
                                      index
                                  ? null
                                  : Border.all(color: Colors.grey.shade600),
                              boxShadow: controller.avatarService
                                          .currentAvatarIndex.value ==
                                      index
                                  ? const [
                                      BoxShadow(
                                        color: Colors.green,
                                        blurRadius: 12.0,
                                      ),
                                    ]
                                  : null,
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(20),
                              child: SizedBox.fromSize(
                                size: const Size.fromRadius(48),
                                // Image radius
                                child: Image.network(
                                  avatars[index].url,
                                  fit: BoxFit.fill,
                                  loadingBuilder: (BuildContext context,
                                      Widget child,
                                      ImageChunkEvent? loadingProgress) {
                                    if (loadingProgress == null) return child;
                                    return Center(
                                      child: CircularProgressIndicator(
                                        value: loadingProgress
                                                    .expectedTotalBytes !=
                                                null
                                            ? loadingProgress
                                                    .cumulativeBytesLoaded /
                                                loadingProgress
                                                    .expectedTotalBytes!
                                            : null,
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    }),
              ),
              const Gap(10),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton.icon(
                    onPressed: () {
                      DialogHelper.hideLoading();
                      controller.avatarService.isAvatar.value = true;
                      controller.isAvatarCustomizable.value = false;
                    },
                    icon: const Icon(Icons.check),
                    label:
                        Text('default-avatar-selection-component.confirm'.tr),
                  ),
                ],
              ),
              const Gap(10),
            ],
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }

  List<Step> _steps() => [
        Step(
          title: Text('customize-avatar-component.gender'.tr),
          content: Obx(() => DropdownButton<String>(
                menuMaxHeight: 150,
                value: controller.gender.value,
                items: [
                  DropdownMenuItem(
                    value: 'Baby',
                    child: Center(
                        child: Text('customize-avatar-component.male'.tr)),
                  ),
                  DropdownMenuItem(
                      value: 'Annie',
                      child: Center(
                          child: Text('customize-avatar-component.female'.tr))),
                ],
                onChanged: (String? value) {
                  controller.gender.value = value!;
                },
              )),
          isActive: controller.currentStep.value == 0,
          state: controller.currentStep.value > 0
              ? StepState.complete
              : StepState.disabled,
        ),
        Step(
          title: Text('customize-avatar-component.skin-color'.tr),
          content: SizedBox(
            height: 80,
            child: BlockPicker(
                pickerColor: controller.skinColor.value,
                availableColors: const [
                  Color(0xFFFFDBB4),
                  Color(0xFFf8d25c),
                  Color(0xFFedb98a),
                  Color(0xFFd08b5b),
                  Color(0xFFae5d29),
                  Color(0xFF614335),
                ],
                onColorChanged: (color) {
                  controller.skinColor.value = color;
                }),
          ),
          isActive: controller.currentStep.value == 1,
          state: controller.currentStep.value > 1
              ? StepState.complete
              : StepState.disabled,
        ),
        Step(
          title: Text('customize-avatar-component.hair-type'.tr),
          content: Obx(() => DropdownButton<String>(
                menuMaxHeight: 150,
                value: controller.hairType.value,
                items: [
                  DropdownMenuItem(
                    value: 'straightAndStrand',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.hair-types.straightAndStrand'
                                .tr)),
                  ),
                  DropdownMenuItem(
                      value: 'longButNotTooLong',
                      child: Center(
                          child: Text(
                              'customize-avatar-component.hair-types.longButNotTooLong'
                                  .tr))),
                  DropdownMenuItem(
                    value: 'shortFlat',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.hair-types.shortFlat'
                                .tr)),
                  ),
                  DropdownMenuItem(
                    value: 'fro',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.hair-types.fro'.tr)),
                  ),
                  DropdownMenuItem(
                    value: 'dreads',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.hair-types.dreads'.tr)),
                  ),
                ],
                onChanged: (String? value) {
                  controller.hairType.value = value!;
                },
              )),
          isActive: controller.currentStep.value == 2,
          state: controller.currentStep.value > 2
              ? StepState.complete
              : StepState.disabled,
        ),
        Step(
          title: Text('customize-avatar-component.hair-color'.tr),
          content: ColorPicker(
            labelTypes: const [ColorLabelType.hex, ColorLabelType.rgb],
            enableAlpha: false,
            portraitOnly: true,
            pickerColor: controller.hairColor.value,
            onColorChanged: (color) {
              controller.hairColor.value = color;
            },
          ),
          isActive: controller.currentStep.value == 3,
          state: controller.currentStep.value > 3
              ? StepState.complete
              : StepState.disabled,
        ),
        Step(
          title: Text('customize-avatar-component.eyes'.tr),
          content: Obx(() => DropdownButton<String>(
                menuMaxHeight: 150,
                value: controller.eyeType.value,
                items: [
                  DropdownMenuItem(
                    value: 'closed',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.eye-types.closed'.tr)),
                  ),
                  DropdownMenuItem(
                      value: 'cry',
                      child: Center(
                          child: Text(
                              'customize-avatar-component.eye-types.cry'.tr))),
                  DropdownMenuItem(
                    value: 'default',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.eye-types.default'.tr)),
                  ),
                  DropdownMenuItem(
                    value: 'hearts',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.eye-types.hearts'.tr)),
                  ),
                  DropdownMenuItem(
                    value: 'surprised',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.eye-types.surprised'
                                .tr)),
                  ),
                ],
                onChanged: (String? value) {
                  controller.eyeType.value = value!;
                },
              )),
          isActive: controller.currentStep.value == 4,
          state: controller.currentStep.value > 4
              ? StepState.complete
              : StepState.disabled,
        ),
        Step(
          title: Text('customize-avatar-component.eyebrows'.tr),
          content: Obx(() => DropdownButton<String>(
                menuMaxHeight: 150,
                value: controller.eyeBrows.value,
                items: [
                  DropdownMenuItem(
                    value: 'angry',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.eyebrows-types.angry'
                                .tr)),
                  ),
                  DropdownMenuItem(
                      value: 'sadConcerned',
                      child: Center(
                          child: Text(
                              'customize-avatar-component.eyebrows-types.sadConcerned'
                                  .tr))),
                  DropdownMenuItem(
                    value: 'default',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.eyebrows-types.default'
                                .tr)),
                  ),
                  DropdownMenuItem(
                    value: 'unibrowNatural',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.eyebrows-types.unibrowNatural'
                                .tr)),
                  ),
                ],
                onChanged: (String? value) {
                  controller.eyeBrows.value = value!;
                },
              )),
          isActive: controller.currentStep.value == 5,
          state: controller.currentStep.value > 5
              ? StepState.complete
              : StepState.disabled,
        ),
        Step(
          title: Text('customize-avatar-component.facialHair'.tr),
          content: Obx(() => DropdownButton<String>(
                menuMaxHeight: 150,
                value: controller.facialHair.value,
                items: [
                  DropdownMenuItem(
                    value: 'none',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.facialHair-types.none'
                                .tr)),
                  ),
                  DropdownMenuItem(
                    value: 'beardLight',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.facialHair-types.beardLight'
                                .tr)),
                  ),
                  DropdownMenuItem(
                      value: 'beardMajestic',
                      child: Center(
                          child: Text(
                              'customize-avatar-component.facialHair-types.beardMajestic'
                                  .tr))),
                  DropdownMenuItem(
                    value: 'moustacheFancy',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.facialHair-types.moustacheFancy'
                                .tr)),
                  ),
                  DropdownMenuItem(
                    value: 'moustacheMagnum',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.facialHair-types.moustacheMagnum'
                                .tr)),
                  ),
                ],
                onChanged: (String? value) {
                  controller.facialHair.value = value!;
                },
              )),
          isActive: controller.currentStep.value == 6,
          state: controller.currentStep.value > 6
              ? StepState.complete
              : StepState.disabled,
        ),
        Step(
          title: Text('customize-avatar-component.facialHair.color'.tr),
          content: ColorPicker(
            labelTypes: const [ColorLabelType.hex, ColorLabelType.rgb],
            enableAlpha: false,
            portraitOnly: true,
            pickerColor: controller.facialHairColor.value,
            onColorChanged: (color) {
              controller.facialHairColor.value = color;
            },
          ),
          isActive: controller.currentStep.value == 7,
          state: controller.currentStep.value > 7
              ? StepState.complete
              : StepState.disabled,
        ),
        Step(
          title: Text('customize-avatar-component.mouth'.tr),
          content: Obx(() => DropdownButton<String>(
                menuMaxHeight: 150,
                value: controller.mouth.value,
                items: [
                  DropdownMenuItem(
                    value: 'default',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.mouth-types.default'
                                .tr)),
                  ),
                  DropdownMenuItem(
                      value: 'grimace',
                      child: Center(
                          child: Text(
                              'customize-avatar-component.mouth-types.grimace'
                                  .tr))),
                  DropdownMenuItem(
                    value: 'sad',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.mouth-types.sad'.tr)),
                  ),
                  DropdownMenuItem(
                    value: 'smile',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.mouth-types.smile'.tr)),
                  ),
                  DropdownMenuItem(
                    value: 'screamOpen',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.mouth-types.screamOpen'
                                .tr)),
                  ),
                  DropdownMenuItem(
                    value: 'vomit',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.mouth-types.vomit'.tr)),
                  ),
                ],
                onChanged: (String? value) {
                  controller.mouth.value = value!;
                },
              )),
          isActive: controller.currentStep.value == 8,
          state: controller.currentStep.value > 8
              ? StepState.complete
              : StepState.disabled,
        ),
        Step(
          title: Text('customize-avatar-component.accessories'.tr),
          content: Obx(() => DropdownButton<String>(
                menuMaxHeight: 150,
                value: controller.accessories.value,
                items: [
                  DropdownMenuItem(
                    value: 'eyepatch',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.accessories-types.eyepatch'
                                .tr)),
                  ),
                  DropdownMenuItem(
                      value: 'sunglasses',
                      child: Center(
                          child: Text(
                              'customize-avatar-component.accessories-types.sunglasses'
                                  .tr))),
                  DropdownMenuItem(
                    value: 'round',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.accessories-types.round'
                                .tr)),
                  ),
                  DropdownMenuItem(
                    value: 'none',
                    child: Center(
                        child: Text(
                            'customize-avatar-component.accessories-types.none'
                                .tr)),
                  ),
                ],
                onChanged: (String? value) {
                  controller.accessories.value = value!;
                },
              )),
          isActive: controller.currentStep.value == 9,
          state: controller.currentStep.value > 9
              ? StepState.complete
              : StepState.disabled,
        ),
        Step(
          title: Text('customize-avatar-component.background-color'.tr),
          content: SizedBox(
            height: 80,
            child: BlockPicker(
                pickerColor: controller.backgroundColor.value,
                availableColors: const [
                  Color(0xFFb6e3f4),
                  Color(0xFFc0aede),
                  Color(0xFFd1d4f9),
                  Color(0xFFffdfbf),
                  Color(0xFFffd5dc),
                ],
                onColorChanged: (color) {
                  controller.backgroundColor.value = color;
                }),
          ),
          isActive: controller.currentStep.value == 10,
          state: controller.currentStep.value > 10
              ? StepState.complete
              : StepState.disabled,
        ),
      ];
}
