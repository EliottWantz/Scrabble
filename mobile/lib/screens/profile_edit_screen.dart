import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/controllers/avatar_controller.dart';
import 'package:client_leger/models/avatar.dart';
import 'package:client_leger/utils/dialog_helper.dart';
import 'package:client_leger/widgets/app_sidebar.dart';
import 'package:client_leger/widgets/input_field.dart';
import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:form_validator/form_validator.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';
import 'package:sidebarx/sidebarx.dart';

class ProfileEditScreen extends GetView<AvatarController> {
  ProfileEditScreen({Key? key}) : super(key: key);
  final sideBarController =
      SidebarXController(selectedIndex: 0, extended: true);
  final ApiRepository _apiRepository = Get.find();

  @override
  Widget build(BuildContext context) {
    return Builder(
        builder: (BuildContext context) => Scaffold(
              body: Row(
                children: [
                  AppSideBar(controller: sideBarController),
                  Expanded(
                    child: Center(
                      child: _buildItems(
                        context,
                      ),
                    ),
                  ),
                ],
              ),
            ));
  }

  Widget _buildItems(BuildContext context) {
    return FutureBuilder<List<Avatar>?>(
        future: _apiRepository.avatars(),
        builder: (BuildContext context, AsyncSnapshot<List<Avatar>?> snapshot) {
          switch (snapshot.connectionState) {
            case ConnectionState.waiting:
              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    CircularProgressIndicator(),
                    Gap(8),
                    Text('Récupération des avatars'),
                  ],
                ),
              );
            default:
              if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}');
              } else {
                if (snapshot.data == null) return const SizedBox();
                final avatars = snapshot.data!;
                return SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 50.0),
                    child: Center(
                        child: SizedBox(
                      height: 800,
                      width: 900,
                      child: Column(
                        children: [
                          Form(
                            key: controller.profileEditFormKey,
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Modifier votre pseudonyme',
                                  style: Theme.of(context).textTheme.headline6,
                                ),
                                const Gap(20.0),
                                SizedBox(
                                  height: 150,
                                  width: 300,
                                  child: Center(
                                    child: Obx(() => InputField(
                                        controller:
                                            controller.usernameEditController,
                                        keyboardType: TextInputType.text,
                                        labelText: controller
                                            .userService.user.value!.username,
                                        placeholder:
                                            'Veuillez entrer votre nouveau pseudonyme',
                                        validator: ValidationBuilder(
                                                requiredMessage:
                                                    'Le champ ne peut pas être vide')
                                            .build())),
                                  ),
                                ),
                                ElevatedButton.icon(
                                  onPressed: () async {
                                    await controller.onProfileChange(context);
                                  },
                                  icon: const Icon(
                                    Icons.change_circle,
                                    size: 20,
                                  ),
                                  label: const Text('Modifier mon pseudonyme'),
                                ),
                              ],
                            ),
                          ),
                          const Gap(20),
                          const Divider(
                            thickness: 2,
                          ),
                          const Gap(20),
                          _buildAvatarEditer(avatars, context),
                        ],
                      ),
                    )),
                  ),
                );
              }
          }
        });
  }

  Widget _buildAvatarEditer(List<Avatar> avatars, BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('Modifier votre avatar',
            style: Theme.of(context).textTheme.headline6),
        const Gap(50),
        Obx(() => CircleAvatar(
              radius: 60,
              backgroundColor: Colors.transparent,
              backgroundImage: controller.getAvatarToDisplay(avatars),
            )),
        const Gap(50),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton.icon(
              onPressed: () {
                _showAvatarOptionsDialog(context, avatars);
              },
              icon: const Icon(
                Icons.perm_identity_sharp,
                size: 50,
              ),
              label: const Text('Choisir un avatar'),
            ),
            const Gap(20),
            Text(
              'Ou',
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
              label: const Text('Prenez votre avatar en photo'),
            ),
            const Gap(20),
            Text(
              'Ou',
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
              label: const Text('Personaliser votre avatar'),
            ),
          ],
        ),
        const Gap(80),
        ElevatedButton.icon(
          onPressed: () async {
            await controller.onAvatarChange(avatars);
          },
          icon: const Icon(
            Icons.change_circle,
            size: 20,
          ),
          label: const Text('Modifier mon avatar'),
        ),
      ],
    );
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
              Text('Selection des avatars',
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
                      controller.isFirst.value = false;
                      DialogHelper.hideLoading();
                      controller.avatarService.isAvatar.value = true;
                      controller.isAvatarCustomizable.value = false;
                    },
                    icon: const Icon(Icons.check),
                    label: const Text('Confirmer'),
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
                                      controller.isFirst.value = false;
                                      DialogHelper.hideLoading();
                                      controller.avatarService.isAvatar.value =
                                          true;
                                      controller.isAvatarCustomizable.value =
                                          true;
                                    },
                                    child: const Text('Générer mon avatar'),
                                  )
                                : ElevatedButton(
                                    onPressed: controls.onStepContinue,
                                    child: const Text('Continuer'),
                                  ),
                            if (controller.currentStep != 0)
                              TextButton(
                                onPressed: controls.onStepCancel,
                                child: const Text(
                                  'Revenir',
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

  List<Step> _steps() => [
        Step(
          title: const Text('Genre'),
          content: Obx(() => DropdownButton<String>(
                menuMaxHeight: 150,
                value: controller.gender.value,
                items: const [
                  DropdownMenuItem(
                    value: 'Baby',
                    child: Center(child: Text('Homme')),
                  ),
                  DropdownMenuItem(
                      value: 'Annie', child: Center(child: Text('Femme'))),
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
          title: const Text('Couleur de peau'),
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
          title: const Text('Type de cheveux'),
          content: Obx(() => DropdownButton<String>(
                menuMaxHeight: 150,
                value: controller.hairType.value,
                items: const [
                  DropdownMenuItem(
                    value: 'straightAndStrand',
                    child: Center(child: Text('Long')),
                  ),
                  DropdownMenuItem(
                      value: 'longButNotTooLong',
                      child: Center(child: Text('Moyen'))),
                  DropdownMenuItem(
                    value: 'shortFlat',
                    child: Center(child: Text('Court')),
                  ),
                  DropdownMenuItem(
                    value: 'fro',
                    child: Center(child: Text('Afro')),
                  ),
                  DropdownMenuItem(
                    value: 'dreads',
                    child: Center(child: Text('Mèches')),
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
          title: const Text('Couleur de cheveux'),
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
          title: const Text('Yeux'),
          content: Obx(() => DropdownButton<String>(
                menuMaxHeight: 150,
                value: controller.eyeType.value,
                items: const [
                  DropdownMenuItem(
                    value: 'closed',
                    child: Center(child: Text('Fermés')),
                  ),
                  DropdownMenuItem(
                      value: 'cry', child: Center(child: Text('Larmes'))),
                  DropdownMenuItem(
                    value: 'default',
                    child: Center(child: Text('Normal')),
                  ),
                  DropdownMenuItem(
                    value: 'hearts',
                    child: Center(child: Text('Amoureux')),
                  ),
                  DropdownMenuItem(
                    value: 'surprised',
                    child: Center(child: Text('Surpris')),
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
          title: const Text('Sourcils'),
          content: Obx(() => DropdownButton<String>(
                menuMaxHeight: 150,
                value: controller.eyeBrows.value,
                items: const [
                  DropdownMenuItem(
                    value: 'angry',
                    child: Center(child: Text('Fachés')),
                  ),
                  DropdownMenuItem(
                      value: 'sadConcerned',
                      child: Center(child: Text('Triste'))),
                  DropdownMenuItem(
                    value: 'default',
                    child: Center(child: Text('Normal')),
                  ),
                  DropdownMenuItem(
                    value: 'unibrowNatural',
                    child: Center(child: Text('Monosourcils')),
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
          title: const Text('Pilosité faciale'),
          content: Obx(() => DropdownButton<String>(
                menuMaxHeight: 150,
                value: controller.facialHair.value,
                items: const [
                  DropdownMenuItem(
                    value: 'none',
                    child: Center(child: Text('Aucun')),
                  ),
                  DropdownMenuItem(
                    value: 'beardLight',
                    child: Center(child: Text('Petite barbe')),
                  ),
                  DropdownMenuItem(
                      value: 'beardMajestic',
                      child: Center(child: Text('Grosse Barbe'))),
                  DropdownMenuItem(
                    value: 'moustacheFancy',
                    child: Center(child: Text('Petite Moustache')),
                  ),
                  DropdownMenuItem(
                    value: 'moustacheMagnum',
                    child: Center(child: Text('Grosse Moustache')),
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
          title: const Text('Couleur des poils'),
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
          title: const Text('Bouche'),
          content: Obx(() => DropdownButton<String>(
                menuMaxHeight: 150,
                value: controller.mouth.value,
                items: const [
                  DropdownMenuItem(
                    value: 'default',
                    child: Center(child: Text('Normal')),
                  ),
                  DropdownMenuItem(
                      value: 'grimace', child: Center(child: Text('Grimace'))),
                  DropdownMenuItem(
                    value: 'sad',
                    child: Center(child: Text('Triste')),
                  ),
                  DropdownMenuItem(
                    value: 'smile',
                    child: Center(child: Text('Sourire')),
                  ),
                  DropdownMenuItem(
                    value: 'screamOpen',
                    child: Center(child: Text('Crier')),
                  ),
                  DropdownMenuItem(
                    value: 'vomit',
                    child: Center(child: Text('Vomis')),
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
          title: const Text('Accessoires'),
          content: Obx(() => DropdownButton<String>(
                menuMaxHeight: 150,
                value: controller.accessories.value,
                items: const [
                  DropdownMenuItem(
                    value: 'eyepatch',
                    child: Center(child: Text('Cache-oeil')),
                  ),
                  DropdownMenuItem(
                      value: 'sunglasses',
                      child: Center(child: Text('Lunettes de soleil'))),
                  DropdownMenuItem(
                    value: 'round',
                    child: Center(child: Text('Lunettes rondes')),
                  ),
                  DropdownMenuItem(
                    value: 'none',
                    child: Center(child: Text('Aucun')),
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
          title: const Text('Couleur de l\'arrière plan'),
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
