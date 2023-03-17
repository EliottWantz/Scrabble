import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatSidenav } from "@angular/material/sidenav";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { NavigationStart, Router } from "@angular/router";
import { RoomService } from "@app/services/room/room.service";
import { ThemeService } from "@app/services/theme/theme.service";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";
//import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: "app-sidebar",
    templateUrl: "./sidebar.component.html",
    styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent {
    @Input() sidenavHandle!: MatSidenav;
  private darkThemeIcon = 'nightlight_round';
  private lightThemeIcon = 'wb_sunny';
  public lightDarkToggleIcon = this.lightThemeIcon;
  currentRoute = "PolyScrabble";
  currentRouteName = "/home";

  constructor(private userService: UserService, private socketService: WebSocketService, private roomService: RoomService, private themeService: ThemeService, private router: Router) {
    this.user = this.userService.subjectUser;
    document.getElementById("avatar")?.setAttribute("src", this.user.value.avatar.url);
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        this.currentRouteName = e.url;
        switch (e.url) {
          case "/home":
            this.currentRoute = "PolyScrabble";
            break;
        
          case "/login":
            this.currentRoute = "Connexion";
            break;

            case "/register":
              this.currentRoute = "Inscription";
              break;
        }
      }
    });
  }

  public doToggleLightDark() {
    this.themeService.switchValue();
    if (this.lightDarkToggleIcon == this.darkThemeIcon) {
        this.lightDarkToggleIcon = this.lightThemeIcon;
    } else {
        this.lightDarkToggleIcon = this.darkThemeIcon;
    }
  }

  readonly title: string = "Scrabble";
  isJoining = false;
  public user: BehaviorSubject<User>;

  isConnected(): boolean {
    return this.userService.isLoggedIn;
  }

  logout(): void {
    this.socketService.disconnect();
  }

  isInGame(): boolean {
    return this.roomService.currentGameRoom.value.id != "";
  }
}