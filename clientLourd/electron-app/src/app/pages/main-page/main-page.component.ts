import { Component } from "@angular/core";
import { GameService } from "@app/services/game/game.service";
import { RoomService } from "@app/services/room/room.service";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { ClientEvent } from "@app/utils/events/client-events";
import { CreateGamePayload } from "@app/utils/interfaces/packet";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-main-page",
  templateUrl: "./main-page.component.html",
  styleUrls: ["./main-page.component.scss"],
})
export class MainPageComponent {
  readonly title: string = "Scrabble";

  constructor(private userService: UserService, private webSocketService: WebSocketService) {}

  isLoggedIn(): boolean {
    return this.userService.isLoggedIn;
  }

  createGame(): void {
    const payload: CreateGamePayload = {
        password: "",
        userIds: []
      }
      const event : ClientEvent = "create-game";
      this.webSocketService.send(event, payload);
  }
}
