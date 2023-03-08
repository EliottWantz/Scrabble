import { Component } from "@angular/core";
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
  isJoining: boolean = false;
  public user: BehaviorSubject<User>;

  constructor(private userService: UserService, private socketService: WebSocketService) {
    this.user = this.userService.subjectUser;
    document.getElementById("avatar")?.setAttribute("src", this.user.value.avatar.URL);
  }

  isConnected(): Boolean {
    return this.userService.isLoggedIn;
  }

  logout(): void {
    this.socketService.disconnect();
  }
}
