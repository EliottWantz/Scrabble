import { Component } from "@angular/core";
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

  constructor(private userService: UserService) {}

  isLoggedIn(): boolean {
    return this.userService.isLoggedIn;
  }
}
