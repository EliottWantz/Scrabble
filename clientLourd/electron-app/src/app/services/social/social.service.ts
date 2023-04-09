import { Injectable } from '@angular/core';
import { User } from '@app/utils/interfaces/user';
import { CommunicationService } from '../communication/communication.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class SocialService {
  public onlineFriends: User[] = [];
  activeScreen = 'En ligne';
  screens = ['En ligne', 'Tous', 'En attente', 'Ajouter un ami'];
  constructor(
    private comSvc: CommunicationService,
    private userSvc: UserService
  ) {
    this.comSvc
      .getOnlineFriends(this.userSvc.currentUserValue.id)
      .then((online) => {
        this.onlineFriends = online.friends;
      });
  }

  public async updatedOnlineFriends() {
    const online = await this.comSvc.getOnlineFriends(
      this.userSvc.currentUserValue.id
    );
    this.onlineFriends = online.friends;
  }
}
