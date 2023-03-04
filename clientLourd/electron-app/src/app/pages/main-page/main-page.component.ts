import { Component } from "@angular/core";
import { AuthenticationService } from "@app/services/authentication/authentication.service";
import { WebsocketService } from "@app/services/web-socket/web-socket.service";
import { User } from "@app/utils/interfaces/user";

@Component({
  selector: "app-main-page",
  templateUrl: "./main-page.component.html",
  styleUrls: ["./main-page.component.scss"],
})
export class MainPageComponent {
  readonly title: string = "Scrabble";
  isJoining: boolean = false;
  public user: User;

  constructor(private authenticationService: AuthenticationService, private socketService: WebsocketService) {
    this.user= this.authenticationService.currentUserValue;
    document.getElementById("avatar")?.setAttribute("src", this.user.avatar.url);
  }

  isConnected(): Boolean {
    return this.authenticationService.isLoggedIn;
  }

  logout(): void {
    this.socketService.disconnect();
  }
}
