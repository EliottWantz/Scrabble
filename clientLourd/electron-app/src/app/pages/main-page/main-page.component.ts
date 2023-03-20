import { Component } from "@angular/core";
import { GameService } from "@app/services/game/game.service";
import { RoomService } from "@app/services/room/room.service";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-main-page",
  templateUrl: "./main-page.component.html",
  styleUrls: ["./main-page.component.scss"],
})
export class MainPageComponent {
  readonly title: string = "Scrabble";
  isJoining = false;
  public user: BehaviorSubject<User>;

  constructor(private userService: UserService, private socketService: WebSocketService, private gameService: GameService) {
    this.user = this.userService.subjectUser;
    document.getElementById("avatar")?.setAttribute("src", this.user.value.avatar.url);
  }

  isConnected(): boolean {
    return this.userService.isLoggedIn;
  }

  logout(): void {
    this.socketService.disconnect();
  }

  isInGame(): boolean {
    if (this.gameService.game.value)
      return this.gameService.game.value.id != "";
    return false;
  }
}
