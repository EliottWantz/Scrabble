import { Component } from "@angular/core";
import { AuthenticationService } from "@app/services/authentication/authentication.service";

@Component({
  selector: "app-main-page",
  templateUrl: "./main-page.component.html",
  styleUrls: ["./main-page.component.scss"],
})
export class MainPageComponent {
  readonly title: string = "Scrabble";
  isJoining: boolean = false;
  public username: string;

  constructor(
    private authentificationService: AuthenticationService
  ) {this.username = "";}

  isConnected(): Boolean {
    return this.authentificationService.isLoggedIn;
  }

  logout(): void {
    this.authentificationService.logout();
  }
}
