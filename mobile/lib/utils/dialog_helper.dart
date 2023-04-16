import 'package:client_leger/api/api_repository.dart';
import 'package:client_leger/models/requests/game_invite_request.dart';
import 'package:client_leger/routes/app_routes.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/services/user_service.dart';
import 'package:client_leger/services/users_service.dart';
import 'package:client_leger/services/websocket_service.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get/get.dart';

class DialogHelper {
  final WebsocketService _websocketService = Get.find();
  final GameService _gameService = Get.find();
  final UsersService _usersService = Get.find();
  final ApiRepository _apiRepository = Get.find();
  final UserService _userService = Get.find();

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

  static Future<void> showLobbyCreatorQuitDialog() async {
    Get.dialog(
      Dialog(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Annuler la création de la partie',
                style: Get.textTheme.headline4,
              ),
              const Gap(20),
              Text(
                'Êtes-vous sûr de vouloir annuler la création de cette partie',
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
                      onPressed: () {
                        if (Get.isDialogOpen!) {
                          DialogHelper()._websocketService.leaveGame(
                              DialogHelper()._gameService.currentGameId
                          );
                          DialogHelper()._gameService.pendingJoinGameRequestUserIds.clear();
                          Get.back();
                          Get.back();
                        }
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

  static Future<void> showLobbyQuitDialog() async {
    Get.dialog(
      Dialog(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Quitter la partie',
                style: Get.textTheme.headline4,
              ),
              const Gap(20),
              Text(
                'Êtes-vous sûr de vouloir quitter cette partie',
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
                      onPressed: () {
                        if (Get.isDialogOpen!) {
                          DialogHelper()._websocketService.leaveGame(
                              DialogHelper()._gameService.currentGameId
                          );
                          Get.back();
                          Get.back();
                          Get.back();
                        }
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

  static void showLeftRoomDialog() {
    Get.dialog(
      Dialog(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("Vous avez quitté le canal!",
                style: Get.textTheme.headline4,
              ),
              const Gap(20),
              ElevatedButton(
                onPressed: () {
                  DialogHelper.hideLoading();
                },
                child: const Text('OK'),
              ),
            ],
          )
        )
      )
    );
  }

  static void showGameOverDialog(String winnerId) {
    Get.dialog(
      Dialog(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("La partie est terminé!",
                style: Get.textTheme.headline4,
              ),
              const Gap(20),
              Text(
                "Le gagnant est ${DialogHelper()._usersService.getUserUsername(winnerId)}",
                style: Get.textTheme.headline6,
              ),
              const Gap(20),
              ElevatedButton(
                onPressed: () {
                  Get.offAllNamed(Routes.HOME);
                  DialogHelper()._gameService.leftGame();
                },
                child: const Text('Retourner au menu principal'),
              ),
            ],
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }

  static void showPoolGameLoserDialog(String observableGameId) {
    Get.dialog(
      Dialog(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("Vous avez été éliminé du tournoi!",
                style: Get.textTheme.headline4,
              ),
              const Gap(20),
              Row(
                children: [
                  ElevatedButton(
                    onPressed: () async {
                      DialogHelper()._gameService.leftGame();
                      DialogHelper()._websocketService.joinGameAsObserver(observableGameId);
                    },
                    child: const Text('Observez la partie en cours'),
                  ),
                  Spacer(),
                  ElevatedButton(
                    onPressed: () {
                      Get.offAllNamed(Routes.HOME);
                      DialogHelper()._gameService.leftGame();
                    },
                    child: const Text('Retourner au menu principal'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }

  static void showJoinFinaleDialogForObserverAndLoser() {
    Get.dialog(
      Dialog(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("La partie est finie!",
                style: Get.textTheme.headline4,
              ),
              const Gap(20),
              Row(
                children: [
                  ElevatedButton(
                    onPressed: () async {
                      DialogHelper()._gameService.leftGame();
                      DialogHelper()._websocketService.joinTournamentFinaleAsObserver();
                    },
                    child: const Text('Observez la partie en cours'),
                  ),
                  Spacer(),
                  ElevatedButton(
                    onPressed: () {
                      Get.offAllNamed(Routes.HOME);
                      DialogHelper()._gameService.leftGame();
                    },
                    child: const Text('Retourner au menu principal'),
                  ),
                ],
              ),
            ],
          ),
        ),
      )
    );
  }

  static void showTournamentObserverPoolGameOverDialog() {
    Get.dialog(
      Dialog(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("La partie est finie!",
                style: Get.textTheme.headline4,
              ),
              const Gap(20),
              Row(
                children: [
                  ElevatedButton(
                    onPressed: () async {
                      DialogHelper()._gameService.leftGame();
                      // DialogHelper()._websocketService.joinGameAsObserver(observableGameId);
                      DialogHelper()._websocketService.joinTournamentFinaleAsObserver();
                    },
                    child: const Text('Observez la partie en cours'),
                  ),
                  Spacer(),
                  ElevatedButton(
                    onPressed: () {
                      Get.offAllNamed(Routes.HOME);
                      DialogHelper()._gameService.leftGame();
                    },
                    child: const Text('Retourner au menu principal'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }

  static void showTournamentObserverJoinOtherPoolGameDialog(String observableGameId) {
    Get.dialog(
      Dialog(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("La partie est finie!",
                style: Get.textTheme.headline4,
              ),
              const Gap(20),
              Row(
                children: [
                  ElevatedButton(
                    onPressed: () async {
                      DialogHelper()._gameService.leftGame();
                      DialogHelper()._websocketService.joinGameAsObserver(observableGameId);
                    },
                    child: const Text('Observez la partie en cours'),
                  ),
                  Spacer(),
                  ElevatedButton(
                    onPressed: () {
                      Get.offAllNamed(Routes.HOME);
                      DialogHelper()._gameService.leftGame();
                    },
                    child: const Text('Retourner au menu principal'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }

  static void showJoinGameRequestRejected() {
    Get.dialog(
      Dialog(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("Le créateur a rejeté votre demande de rejoindre la partie",
                style: Get.textTheme.headline4,
              ),
              const Gap(20),
              ElevatedButton(
                onPressed: () {
                  DialogHelper.hideLoading();
                },
                child: const Text('Fermer'),
              ),
            ],
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }

  static void showInvitedToGameDialog(String userId, String gameId) {
    Get.dialog(
      Dialog(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("${DialogHelper()._usersService.getUserUsername(userId)} vous invite à rejoindre une partie.",
                style: Get.textTheme.headline4,
              ),
              const Gap(20),
              Row(
                children: [
                  ElevatedButton(
                    onPressed: () async {
                      GameInviteRequest gameInviteAccepted = GameInviteRequest(
                          invitedId: DialogHelper()._userService.user.value!.id,
                          inviterId: userId,
                          gameId: DialogHelper()._gameService.currentGameId);
                      DialogHelper()._apiRepository.acceptGameInvite(gameInviteAccepted);
                      DialogHelper.hideLoading();
                    },
                    child: const Text('Accepter'),
                  ),
                  Spacer(),
                  ElevatedButton(
                    onPressed: () {
                      DialogHelper.hideLoading();
                    },
                    child: const Text('Rejeter'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }
}
