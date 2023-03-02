import { Component } from "@angular/core";
import { AuthenticationService } from "@app/services/authentication/authentication.service";
import { StorageService } from "@app/services/storage/storage.service";

@Component({
  selector: "app-main-page",
  templateUrl: "./main-page.component.html",
  styleUrls: ["./main-page.component.scss"],
})
export class MainPageComponent {
  readonly title: string = "Scrabble";
  isJoining: boolean = false;
  public username: string;

  constructor(private authenticationService: AuthenticationService, private storageService: StorageService) {
    this.username = "";
  }

  isConnected(): Boolean {
    if (this.authenticationService.isLoggedIn) {
      const avatar = this.storageService.getUser()?.avatar;
      if (avatar)
        document.getElementById("avatar")?.setAttribute("src", avatar.url);
      return true;
    }
    return false;
  }

  logout(): void {
    this.authenticationService.logout();
  }
}
