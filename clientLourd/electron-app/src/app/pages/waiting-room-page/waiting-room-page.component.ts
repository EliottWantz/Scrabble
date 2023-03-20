import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { CommunicationService } from "@app/services/communication/communication.service";
import { GameService } from "@app/services/game/game.service";
import { RoomService } from "@app/services/room/room.service";
import { StorageService } from "@app/services/storage/storage.service";
// import { MessageErrorStateMatcher } from "@app/classes/form-error/error-state-form";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { ClientEvent } from "@app/utils/events/client-events";
import { Game } from "@app/utils/interfaces/game/game";
import { JoinDMPayload, StartGame } from "@app/utils/interfaces/packet";
import { Summary, UserStats } from "@app/utils/interfaces/summary";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-waiting-room-page",
  templateUrl: "./waiting-room-page.component.html",
  styleUrls: ["./waiting-room-page.component.scss"],
})
export class WaitRoomPageComponent {
  gameRoom!: BehaviorSubject<Game>;
  constructor(private gameService: GameService, private userService: UserService, private socketService: WebSocketService) {
    this.gameRoom = this.gameService.game
  }

  /*isCreator(): boolean {
    return this.userService.currentUserValue.id == this.gameRoom.value.creatorId;
  }*/

  startGame(): void {
      console.log(this.gameRoom.value);
      if(this.gameRoom.value.players.length < 2){
          return;
      }
      const payload: StartGame = {
          roomId: this.gameRoom.value.id
        }
        const event : ClientEvent = "start-game";
        this.socketService.send(event, payload);
  }
}
