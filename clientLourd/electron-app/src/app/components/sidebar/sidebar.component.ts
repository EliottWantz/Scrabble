import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDrawer, MatSidenav } from '@angular/material/sidenav';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { NavigationStart, Router } from '@angular/router';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { GameService } from '@app/services/game/game.service';
import { RoomService } from '@app/services/room/room.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { UserService } from '@app/services/user/user.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { User } from '@app/utils/interfaces/user';
import { BehaviorSubject } from 'rxjs';

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

  private darkThemeIcon = 'nightlight_round';
  private lightThemeIcon = 'wb_sunny';
  public lightDarkToggleIcon = this.lightThemeIcon;
  readonly title: string = 'Scrabble';
  isJoining = false;
  public user: BehaviorSubject<User>;
  currentRoute = 'PolyScrabble';
  currentRouteName = '/home';
  previousRouteName = ['/home'];

  constructor(
    private userService: UserService,
    private authService: AuthenticationService,
    private gameService: GameService,
    private themeService: ThemeService,
    private router: Router
  ) {
    this.user = this.userService.subjectUser;
    document
      .getElementById('avatar')
      ?.setAttribute('src', this.user.value.avatar.url);
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        this.previousRouteName.push(this.currentRouteName);
        this.currentRouteName = e.url;
        switch (e.url) {
          case '/home':
            this.currentRoute = 'PolyScrabble';
            this.selectNav(0);
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
      this.drawer.close();
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

  isConnected(): boolean {
    return this.userService.isLoggedIn;
  }

  logout(): void {
    this.router.navigate(['/home']);
    this.authService.logout();
  }

  isInGame(): boolean {
    return this.gameService.scrabbleGame.value.id != '';
  }

  return(): void {
    if (this.previousRouteName[this.previousRouteName.length - 1] == '/home') {
      this.previousRouteName = ['/home'];
      this.router.navigate(['/home']);
    } else {
      const routeToGo = this.previousRouteName.pop();
      this.router.navigate([routeToGo]);
    }
  }

  getFriends(): string[] {
    return this.user.value.friends;
  }

  selectNav(index: number): void {
    const navButtons = document.getElementsByClassName('nav-button');
    for (let i = 0; i < navButtons.length; i++) {
      if (i != index) {
        navButtons[i].setAttribute('style', '');
      } else {
        navButtons[i].setAttribute(
          'style',
          'background-color: #424260; outline-color: #66678e; outline-width: 1px; outline-style: solid;'
        );
      }
    }
  }
}
