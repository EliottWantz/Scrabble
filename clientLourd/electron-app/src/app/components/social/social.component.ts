import { AfterViewInit, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CommunicationService } from "@app/services/communication/communication.service";
import { RoomService } from "@app/services/room/room.service";
import { SocialService } from "@app/services/social/social.service";
import { StorageService } from "@app/services/storage/storage.service";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-social",
  templateUrl: "./social.component.html",
  styleUrls: ["./social.component.scss"],
})
export class SocialComponent implements AfterViewInit, OnInit {
  onlineFriendUserNameSearch = "";
  addFriendUserName = "";
  allFriendUserNameSearch = "";
  user: BehaviorSubject<User>;
  listUserDisplay: User[];
  listFriendsDisplay: User[];
  listOnlineFriendsDisplay: User[];
  usernameInput: any;

  constructor(private userService: UserService, private websocketService: WebSocketService, private communicationService: CommunicationService,
    private storageService: StorageService, public socialService: SocialService, private router: Router) {
    this.user = this.userService.subjectUser;
    this.listUserDisplay = [];
    this.listFriendsDisplay = [];
    this.listOnlineFriendsDisplay = [];

  }

  ngOnInit(): void {
    this.listUserDisplay = this.socialService.addFriendList$.value;
    this.listFriendsDisplay = this.socialService.friendsList$.value;
    this.listOnlineFriendsDisplay = this.socialService.onlineFriends$.value;

  }

  ngAfterViewInit(): void {
    const index = this.socialService.screens.indexOf(this.socialService.activeScreen);
    const navButtons = document.getElementsByClassName('nav-text');
    navButtons[index].setAttribute("style", "background-color: #424260; outline-color: #66678e; outline-width: 1px; outline-style: solid;");
  }

  sendFriendRequest(id: string): void {
    this.communicationService.requestSendFriendRequest(this.userService.currentUserValue.id, id).subscribe(() => {
      this.socialService.updatedAddList();
    });
  }

  selectNavButton(index: number): void {
    this.socialService.activeScreen = this.socialService.screens[index];
    const navButtons = document.getElementsByClassName('nav-text');
    for (let i = 0; i < navButtons.length; i++) {
      if (i != index) {
        navButtons[i].setAttribute("style", "");
      } else {
        navButtons[i].setAttribute("style", "background-color: #424260; outline-color: #66678e; outline-width: 1px; outline-style: solid; max-height: 30px");
      }
    }
    switch (index) {
      case 0:
        this.socialService.updatedOnlineFriends();
        this.socialService.onlineFriends$.subscribe((list) => {
          this.listOnlineFriendsDisplay = list;
        });
        break;
      case 1:
        this.socialService.updatedFriendsList();
        this.socialService.friendsList$.subscribe((list) => {
          this.listFriendsDisplay = list;
        });
        break;
      case 2:
        this.socialService.updatedPendingFriendRequest();
        break;
      case 3:
        this.socialService.updatedAddList();
        this.socialService.addFriendList$.subscribe((list) => {
          this.listUserDisplay = list;
        });
        break;
      default:
        break;
    }
  }

  getScreen(): string {
    return this.socialService.activeScreen;
  }

  getUserAvatarUrl(id: string): string {
    const requestUser = this.storageService.getUserFromId(id);
    if (requestUser) {
      return requestUser.avatar.url;
    }
    return "";
  }

  getUserUsername(id: string): string {
    const requestUser = this.storageService.getUserFromId(id);
    if (requestUser) {
      return requestUser.username;
    }
    return "";
  }


  onSearchChange(input: string): void {
    this.listUserDisplay = this.socialService.addFriendList$.value.filter((user) => { return user.username.toLowerCase().includes(input.toLowerCase()) });
  }

  onSeachChangeOnlineFriend(input: string): void {
    this.listOnlineFriendsDisplay = this.socialService.onlineFriends$.value.filter((user) => { return user.username.toLowerCase().includes(input.toLowerCase()) })
  }

  onSearChangeFriend(input: string): void {
    this.listFriendsDisplay = this.socialService.friendsList$.value.filter((user) => { return user.username.toLowerCase().includes(input.toLowerCase()) })
  }

  async acceptFriendRequest(id: string): Promise<void> {
    this.communicationService.requestAcceptFriendRequest(this.userService.currentUserValue.id, id).subscribe(() => {
      this.socialService.updatedOnlineFriends();
      this.socialService.updatedPendingFriendRequest();
    });
  }

  denyFriendRequest(id: string): void {
    this.communicationService.requestDeclineFriendRequest(this.userService.currentUserValue.id, id).subscribe(() => {
      this.socialService.updatedOnlineFriends();
      this.socialService.updatedPendingFriendRequest();
    });
  }

  goToFriendStats(user: User): void {
    console.log("main user", user);
    this.router.navigate(["/friendStats"], { queryParams: { data: JSON.stringify(user) } });
  }
}