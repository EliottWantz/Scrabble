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
  public addFriendList$ = new BehaviorSubject<User[]>([]);
  public friendsList$ = new BehaviorSubject<User[]>([]);
  public pendingFriendRequest$ = new BehaviorSubject<User[]>([]);

  currentMessage = this.onlineFriends$.asObservable();
  activeScreen = 'Tous';
  screens = ['Tous', 'En attente', 'Ajouter un ami'];
  constructor(
    private comSvc: CommunicationService,
    private userSvc: UserService
  ) {
    if (this.userSvc.currentUserValue.id != "0") {
      this.comSvc.getOnlineFriends(this.userSvc.currentUserValue.id).subscribe((users) => {
        this.onlineFriends$.next(users.friends);
      });

      this.comSvc.getAddList(this.userSvc.currentUserValue.id).subscribe((users) => {
        this.addFriendList$.next(users.users);
      });

      this.comSvc.getFriendsList(this.userSvc.currentUserValue.id).subscribe((users) => {
        this.friendsList$.next(users.friends);
      });
      this.comSvc.getFriendRequests(this.userSvc.currentUserValue.id).subscribe((users) => {
        this.pendingFriendRequest$.next(users.friendRequests);
      });
    }
  }

  public updatedOnlineFriends() {
    this.comSvc.getOnlineFriends(this.userSvc.currentUserValue.id).subscribe((users) => {
      console.log(users);
      this.onlineFriends$.next(users.friends);
    });
  }

  public updatedAddList() {
    this.comSvc.getAddList(this.userSvc.currentUserValue.id).subscribe((users) => {
      this.addFriendList$.next(users.users);
    });
  }

  public updatedFriendsList() {
    this.comSvc.getFriendsList(this.userSvc.currentUserValue.id).subscribe((users) => {
      this.friendsList$.next(users.friends);
    });
  }

  public updatedPendingFriendRequest() {
    this.comSvc.getFriendRequests(this.userSvc.currentUserValue.id).subscribe((users) => {
      this.pendingFriendRequest$.next(users.friendRequests);
    });
  }
}
