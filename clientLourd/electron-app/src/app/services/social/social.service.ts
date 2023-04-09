import { Injectable } from '@angular/core';
import { User } from '@app/utils/interfaces/user';
import { BehaviorSubject } from 'rxjs';
import { CommunicationService } from '../communication/communication.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class SocialService {
  public onlineFriends$ = new BehaviorSubject<User[]>([]);
  currentMessage = this.onlineFriends$.asObservable();
  activeScreen = 'En ligne';
  screens = ['En ligne', 'Tous', 'En attente', 'Ajouter un ami'];
  constructor(
    private comSvc: CommunicationService,
    private userSvc: UserService
  ) {
    this.comSvc
      .getOnlineFriends(this.userSvc.currentUserValue.id)
      .then((online) => {
        this.onlineFriends$.next(online.friends);
      });
  }

  public async updatedOnlineFriends() {
    this.comSvc
      .getOnlineFriends(this.userSvc.currentUserValue.id)
      .then((online) => {
        this.onlineFriends$.next(online.friends);
      });
  }
}
