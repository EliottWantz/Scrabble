import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GameService } from '@app/services/game/game.service';
import { BehaviorSubject } from 'rxjs';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Room } from '@app/utils/interfaces/room';
import { RoomService } from '@app/services/room/room.service';
import { ClientEvent } from '@app/utils/events/client-events';
import { Game } from '@app/utils/interfaces/game/game';
import { CreateGamePayload, JoinGamePayload, StartGamePayload } from '@app/utils/interfaces/packet';

@Component({    
    selector: 'app-parameters',
    templateUrl: './parameters.component.html',
    styleUrls: ['./parameters.component.scss'],
})
export class ParametersComponent implements OnInit {
    // @ViewChild('stepper') stepper: MatStepper;

    createMultiplayer: boolean;
    maxValue: boolean;
    minValue: boolean;
    formPageButtonActive: boolean;
    name: FormControl;
    games$: BehaviorSubject<Game[]>;
    waiting: boolean;
    created: boolean;
    currentGameRoom: BehaviorSubject<Game | undefined>;

    constructor(
        private matDialog: MatDialog,
        public gameService: GameService,
        public roomService: RoomService,
        public webSocketService: WebSocketService,
    ) {

        this.name = new FormControl('', [Validators.required, Validators.minLength(3)]);
        this.createMultiplayer = true;
        this.minValue = false;
        this.maxValue = false;
        this.waiting = false;
        this.formPageButtonActive = true;
        // this.gameService.init();
        this.games$ = this.gameService.joinableGames;
        this.currentGameRoom = this.gameService.game;
        //console.log(this.games$.value);
        this.created = false;
    }

    ngOnInit() {
        this.games$.subscribe(() => {
            //console.log("hello");
            //console.log(this.games$.value);
        });
        /*this.currentRoom.subscribe(() => {
            console.log("hello");
            console.log(this.games$.value);
        });*/
        //console.log(this.games$.value);
    }

    closeModal(): void {
        this.matDialog.closeAll();
        this.name.setValue('');
        // if (!this.gameService.wsService.socketAlive()) return;
        // if (this.gameService.game.value.id {
        //     if (this.gameService.playerId === this.gameService.game$.value.creator.id) this.gameService.wsService.deleteGame();
        //     else this.gameService.wsService.removeOpponent();
        // } else this.gameService.wsService.disconnect();
        return;
    }

    async goToPageForm(page: string): Promise<void> {
        if (page === 'create') {
            this.createMultiplayer = true;
        } else if (page === 'join') {
            this.createMultiplayer = false;
        } else {
            return;
        }
        // this.stepper.next();
        this.formPageButtonActive = true;
        this.name.markAsUntouched();
    }

    getErrorMessage(): string {
        return "error"
    }

    async createGame(): Promise<void> {
        const payload: CreateGamePayload = {
            password: "",
            userIds: []
          }
          const event : ClientEvent = "create-game";
          this.webSocketService.send(event, payload);
          this.waiting = true;
        this.created = true;
    }
    // listOfGame(): void {
    //     if (!this.name.errors) {
    //         //this.stepper.selectedIndex = STEPPER_PAGE_IDX.gameListPage;
    //         this.formPageButtonActive = false;
    //     } else {
    //         this.name.markAllAsTouched();
    //         return;
    //     }
    //     this.gameService.viewGames(this.name.value);
    // }
    joinGame(gameId: string, password: string): void {
        //this.stepper.selectedIndex = STEPPER_PAGE_IDX.confirmationPage;
        const payload: JoinGamePayload = {
            gameId: gameId,
            password: password
          }
          const event : ClientEvent = "join-game";
          this.webSocketService.send(event, payload);
    }

    startGame(): void {
        /*for(const game of this.roomService.rooms.value){
            if(game.isGameRoom && game.creatorId === this.userService.currentUserValue.id){
                if(game.userIds.length < 2){
                    return;
                }
                gameId = game.id;
            }
        }*/
        console.log(this.currentGameRoom.value);
        if (this.currentGameRoom.value) {
            if(this.currentGameRoom.value.userIds.length < 2){
                return;
            }
            const payload: StartGamePayload = {
                gameId: this.currentGameRoom.value.id
              }
              const event : ClientEvent = "start-game";
              this.webSocketService.send(event, payload);
              this.waiting = true;
        }
    }
}
