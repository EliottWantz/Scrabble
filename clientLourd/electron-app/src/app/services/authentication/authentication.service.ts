import { Injectable } from '@angular/core';
import { User } from '@app/utils/interfaces/user';
import { CommunicationService } from '@app/services/communication/communication.service';
import { StorageService } from '../storage/storage.service';
import { UserService } from '@app/services/user/user.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { BehaviorSubject } from 'rxjs';
import { ThemeService } from '@app/services/theme/theme.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  username = '';
  password = '';
  isLoginFailed = false;
  errorMessage = '';
  tempUserLogin: BehaviorSubject<FormData>;
  constructor(
    private commService: CommunicationService,
    private storageService: StorageService,
    private userService: UserService,
    private socketService: WebSocketService,
    private themeService: ThemeService
  ) {
    this.tempUserLogin = new BehaviorSubject<FormData>(new FormData());
  }

  async login(
    username: string,
    password: string
  ): Promise<{ statusCode: number; success: boolean }> {
    // return await this.commService
    //   .login(username, password)
    //   .then((res) => {
    //     console.log(res);
    //     this.setUser(res);
    //     this.socketService.connect();
    //     return { err: '', success: true };
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     this.errorMessage = err.message;
    //     this.isLoginFailed = true;
    //     return { err: err.message, success: false };
    //   });
    try {
      const res = await this.commService.login(username, password);
      console.log(res);
      if (res.status == 200) {
        this.setUser({ user: res.user!, token: res.token });
        this.socketService.connect();
        return { statusCode: res.status, success: true };
      } else {
        return { statusCode: res.status, success: false };
      }
    } catch (error: any) {
      console.log(error);
      this.errorMessage = error.message;
      this.isLoginFailed = true;
      return { statusCode: 500, success: false };
    }
  }

  async register(): Promise<boolean> {
    return await this.commService
      .register(this.tempUserLogin.value)
      .then((res) => {
        this.setUser(res);
        this.socketService.connect();
        this.tempUserLogin = new BehaviorSubject<FormData>(new FormData());
        return true;
      })
      .catch((err) => {
        this.errorMessage = err.message;
        this.isLoginFailed = true;
        this.tempUserLogin = new BehaviorSubject<FormData>(new FormData());
        return false;
      });
  }

  private setUser(res: { user: User; token: string }): void {
    this.userService.setUser({
      id: res.user.id,
      username: res.user.username,
      email: res.user.email,
      avatar: res.user.avatar,
      preferences: res.user.preferences,
      joinedChatRooms: res.user.joinedChatRooms,
      joinedDMRooms: res.user.joinedDMRooms,
      joinedGame: res.user.joinedGame,
      friends: res.user.friends,
      pendingRequests: res.user.pendingRequests,
      summary: res.user.summary,
    });
    this.storageService.saveUserToken(res.token);
    this.isLoginFailed = false;
    //this.websocketService.connect();
  }

  logout(): void {
    this.userService.deleteUser();
    this.socketService.disconnect();
  }
}
