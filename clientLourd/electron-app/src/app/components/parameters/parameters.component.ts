import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper, MatStep } from '@angular/material/stepper';
import { GameService } from '@app/services/game/game.service';
import { UserService } from '@app/services/user/user.service';
import { Game } from '@app/utils/interfaces/game/game';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from "@app/utils/interfaces/user";
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Room } from '@app/utils/interfaces/room';
import { RoomService } from '@app/services/room/room.service';
import { CreateGameRoomPayload, JoinDMPayload, JoinGameRoomPayload, StartGame } from '@app/utils/interfaces/packet';
import { ClientEvent } from '@app/utils/events/client-events';

@Component({    
    selector: 'parameters',
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
    games$: BehaviorSubject<Room[]>;
    waiting: boolean;
    created: boolean;

    constructor(
        private matDialog: MatDialog,
        public gameService: GameService,
        public roomService: RoomService,
        public webSocketService: WebSocketService,
        public userService : UserService
    ) {

        this.name = new FormControl('', [Validators.required, Validators.minLength(3)]);
        this.createMultiplayer = true;
        this.minValue = false;
        this.maxValue = false;
        this.waiting = false;
        this.formPageButtonActive = true;
        // this.gameService.init();
        this.games$ = this.roomService.rooms;
        console.log(this.games$.value);
        this.created = false;
    }

    ngOnInit() {
        this.games$.subscribe(() => {
            console.log("hello");
            console.log(this.games$.value);
        });
        console.log(this.games$.value);
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

    async goToPageForm(page: string, mode: string = 'Multi'): Promise<void> {
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
        const payload: CreateGameRoomPayload = {
            userIDs: []
          }
          const event : ClientEvent = "create-game-room";
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
    joinGame(gameId: string): void {
        //this.stepper.selectedIndex = STEPPER_PAGE_IDX.confirmationPage;
        const payload: JoinGameRoomPayload = {
            gameID: gameId,
          }
          const event : ClientEvent = "join-game-room";
          this.webSocketService.send(event, payload);
    }

    startGame(): void {
        let gameId :string = "";
        for(const game of this.roomService.rooms.value){
            if(game.isGameRoom && game.creatorID === this.userService.currentUserValue.id){
                if(game.users.length != 4){
                    return;
                }
                gameId = game.ID;
            }
        }
        const payload: StartGame = {
            gameID: gameId
          }
          const event : ClientEvent = "start-game";
          this.webSocketService.send(event, payload);
          this.waiting = true;
    }

    async console():Promise<void>{
        console.log(this.games$);
        this.games$ = this.roomService.rooms;
      }
}
