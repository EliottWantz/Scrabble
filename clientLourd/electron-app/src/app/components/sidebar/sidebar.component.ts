import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { NavigationStart, Router } from "@angular/router";
import { AuthenticationService } from "@app/services/authentication/authentication.service";
import { GameService } from "@app/services/game/game.service";
import { RoomService } from "@app/services/room/room.service";
import { ThemeService } from "@app/services/theme/theme.service";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { LeaveGamePayload } from "@app/utils/interfaces/packet";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";
//import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDrawer, MatSidenav } from '@angular/material/sidenav';
import { Room } from "@app/utils/interfaces/room";

//import { FormBuilder, FormGroup, Validators } from "@angular/forms";
const electron = (window as any).require('electron');
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input() sidenavHandle!: MatSidenav;
  @ViewChild('drawer') drawer!: MatDrawer;
  modeFenetrer = false;
  private darkThemeIcon = 'wb_sunny';
  private lightThemeIcon = 'nightlight_round';
  public lightDarkToggleIcon = this.lightThemeIcon;
  readonly title: string = 'Scrabble';
  isJoining = false;
  public user: BehaviorSubject<User>;
  language: BehaviorSubject<string>;
  currentRoute = "PolyScrabble";
  currentRouteName = "/home";
  previousRouteName: string[] = ["/home"];
  routeIndex = 0;

  constructor(private userService: UserService, private roomSvc: RoomService, private authService: AuthenticationService, private gameService: GameService, private themeService: ThemeService, private router: Router,
    private webSocketService: WebSocketService) {
    this.user = this.userService.subjectUser;
    document
      .getElementById('avatar')
      ?.setAttribute('src', this.user.value.avatar.url);
    this.language = this.themeService.language;
    document
      .getElementById('avatar')
      ?.setAttribute('src', this.user.value.avatar.url);
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        this.previousRouteName.push(this.currentRouteName);
        this.routeIndex++;
        this.currentRouteName = e.url;
        switch (e.url) {
          case "/home":
            this.currentRoute = "PolyScrabble";
            this.selectNav(0);
            this.previousRouteName = ['/home'];
            this.routeIndex = 0;
            break;

          case '/login':
            this.currentRoute = 'Connexion';
            break;

          case '/register':
            this.currentRoute = 'Inscription';
            break;

          case '/avatar':
            this.currentRoute = "Choix de l'avatar";
            break;

          case '/find-game':
            this.currentRoute = 'Options de jeu';
            break;
        }
      }
    });
  }
  ngOnInit(): void {
    electron.ipcRenderer.on('user-data', () => {
      this.modeFenetrer = true;
    });

    this.themeService.theme.subscribe((theme) => {
      if (theme == 'dark') {
        this.lightDarkToggleIcon = this.darkThemeIcon;
      } else {
        this.lightDarkToggleIcon = this.lightThemeIcon;
      }
    });

  }

  public doToggleLightDark() {
    this.themeService.switchTheme();
  }

  switchLanguage() {
    this.themeService.switchLanguage();
  }

  isConnected(): boolean {
    return this.userService.isLoggedIn;
  }

  logout(): void {
    this.router.navigate(['/home']);
    this.authService.logout();
    setTimeout(() => {
      window.location.reload();
      electron.ipcRenderer.send('logout');
    }, 100);
  }

  isInGame(): boolean {
    return this.gameService.scrabbleGame.value != undefined;
  }

  isInGameLobby(): boolean {
    return this.gameService.game.value != undefined;
  }

  return(): void {
    if (this.isInGameLobby() && this.gameService.game.value) {
      const payload: LeaveGamePayload = {
        gameId: this.gameService.game.value.id
      }
      this.webSocketService.send("leave-game", payload);
      this.gameService.game.next(undefined);
    }
    if (this.previousRouteName[this.previousRouteName.length - 1] == '/home') {
      this.previousRouteName = ['/home'];
      this.router.navigate(['/home']);
    } else {
      this.routeIndex--;
      this.router.navigate([this.previousRouteName[this.routeIndex]]);
    }
  }

  getFriends(): string[] {
    return this.user.value.friends;
  }

  navigateHome(): void {
    if (this.router.url !== '/waitingRoom')
      this.router.navigate(['/home']);
  }

  selectNav(index: number): void {
    const navButtons = document.getElementsByClassName('nav-button');
    let wasThere = false;
    for (let i = 0; i < navButtons.length; i++) {
      if (i != index) {
        navButtons[i].setAttribute('style', '');
      } else {
        wasThere = true;
        navButtons[i].setAttribute(
          'style',
          'background-color: #424260; outline-color: #66678e; outline-width: 1px; outline-style: solid;'
        );
      }
    }
    if (!wasThere) {
      navButtons[navButtons.length - 1].setAttribute(
        'style',
        'background-color: #424260; outline-color: #66678e; outline-width: 1px; outline-style: solid;'
      );
    }
  }
}
