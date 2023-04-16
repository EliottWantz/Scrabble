import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { CommunicationService } from "@app/services/communication/communication.service";
import { GameService } from "@app/services/game/game.service";
import { RoomService } from "@app/services/room/room.service";
import { SocialService } from "@app/services/social/social.service";
import { StorageService } from "@app/services/storage/storage.service";
// import { MessageErrorStateMatcher } from "@app/classes/form-error/error-state-form";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { ClientEvent } from "@app/utils/events/client-events";
import { Game } from "@app/utils/interfaces/game/game";
import { Tournament } from "@app/utils/interfaces/game/tournament";
import { StartGamePayload, StartTournamentPayload } from "@app/utils/interfaces/packet";
import { Summary, UserStats } from "@app/utils/interfaces/summary";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-waiting-room-page",
  templateUrl: "./waiting-room-page.component.html",
  styleUrls: ["./waiting-room-page.component.scss"],
})
export class WaitRoomPageComponent implements OnInit {
  gameRoom!: BehaviorSubject<Game | undefined>;
  tournamentRoom!: BehaviorSubject<Tournament | undefined>;
  users: {userId: string, username: string}[];
  usersWaiting: {userId: string, username: string}[];
  user: User;
  onlineFriends: User[];
  constructor(private gameService: GameService, private userService: UserService, private socketService: WebSocketService, private storageService: StorageService,
    private commService: CommunicationService, private socialService: SocialService) {
    this.gameRoom = this.gameService.game
    this.tournamentRoom = this.gameService.tournament
    this.user = this.userService.currentUserValue
    this.users = [];
    this.usersWaiting = [];
    this.onlineFriends = [];
    this.gameService.game.subscribe((game) => {
      if (game)
        this.getPlayers(game);
    });
    this.gameService.tournament.subscribe((tournament) => {
      if (tournament)
        this.getPlayersTournament(tournament);
    });

    this.gameService.usersWaiting.subscribe((users) => {
      this.usersWaiting = users;
    });

    
  }

  ngOnInit(): void {
    //this.socialService.updatedOnlineFriends();
    this.socialService.onlineFriends$.subscribe((users) => {
      this.onlineFriends = users;
    });
  }


  /*isCreator(): boolean {
    return this.userService.currentUserValue.id == this.gameRoom.value.creatorId;
  }*/

  startGame(): void {
      //console.log(this.gameRoom.value);
      if (this.gameRoom.value) {
        if(this.gameRoom.value.userIds.length < 2){
          return;
        }
        const payload: StartGamePayload = {
          gameId: this.gameRoom.value.id
        }
        const event : ClientEvent = "start-game";
        this.socketService.send(event, payload);
      }
  }

  startTournament(): void {
    //console.log(this.gameRoom.value);
    if (this.tournamentRoom.value) {
      if(this.tournamentRoom.value.userIds.length < 4){
        return;
      }
      const payload: StartTournamentPayload = {
        tournamentId: this.tournamentRoom.value.id
      }
      const event : ClientEvent = "start-tournament";
      this.socketService.send(event, payload);
    }
}

  getPlayers(game: Game): void {
    this.users = [];
      for (const id of game.userIds) {
        const user = this.storageService.getUserFromId(id);
        if (user && user.id != this.userService.currentUserValue.id)
          this.users.push({userId: id, username: user.username});
      }
  }

  getPlayersTournament(tournament: Tournament): void {
    this.users = [];
      for (const id of tournament.userIds) {
        const user = this.storageService.getUserFromId(id);
        if (user && user.id != this.userService.currentUserValue.id)
          this.users.push({userId: id, username: user.username});
      }
  }

  getNumUsers(): number {
    if (this.gameRoom.value)
      return this.gameRoom.value.userIds.length;
    if(this.tournamentRoom.value)
      return this.tournamentRoom.value.userIds.length;
    return 0;
  }

  checkIfCreator(): boolean {
    return this.userService.currentUserValue.id == this.gameRoom.value?.creatorId;
  }

  checkIfCreatorTournament(): boolean {
    return this.userService.currentUserValue.id == this.tournamentRoom.value?.creatorId;
  }

  /*getUserNamesAndAvatarUrls(game: Game): string {
    for (const id of game.userIds) {
      const user = this.storageService.getUserFromId(id);
      if (user && user.id != this.userService.currentUserValue.id)
        return user.username;
    }
    const requestUser = this.storageService.getUserFromId(id);
    if (requestUser) {
      return requestUser.avatar.url;
    }
    return "";
  }*/

  getAvatarUrl(id: string): string {
    const user = this.storageService.getUserFromId(id);
    if (user) {
      return user.avatar.url;
    }
    return "";
  }

  acceptPlayer(requestorId: string): void {
    if (this.gameRoom.value)
      this.commService.acceptPlayer(this.userService.currentUserValue.id, requestorId, this.gameRoom.value.id).then(() => {
        //console.log("accepted");
        const newUsersWaiting = this.gameService.usersWaiting.value;
        for (const userWaiting of newUsersWaiting) {
          if (userWaiting.userId == requestorId)
            newUsersWaiting.splice(newUsersWaiting.indexOf(userWaiting), 1);
        }
        this.gameService.usersWaiting.next(newUsersWaiting);
      }).catch((err) => {
        console.log(err);
      });
  }

  denyPlayer(requestorId: string): void {
    if (this.gameRoom.value)
      this.commService.denyPlayer(this.userService.currentUserValue.id, requestorId, this.gameRoom.value.id).then(() => {
        /*const newUsersWaiting = this.gameService.usersWaiting.value;
          for (const userWaiting of newUsersWaiting) {
            if (userWaiting.userId == requestorId)
              newUsersWaiting.splice(newUsersWaiting.indexOf(userWaiting), 1);
          }
          this.gameService.usersWaiting.next(newUsersWaiting);*/
      }).catch((err) => {
        if (err.error.message === "The user has revoked the request to join the game") {
          const newUsersWaiting = this.gameService.usersWaiting.value;
          for (const userWaiting of newUsersWaiting) {
            if (userWaiting.userId == requestorId)
              newUsersWaiting.splice(newUsersWaiting.indexOf(userWaiting), 1);
          }
          this.gameService.usersWaiting.next(newUsersWaiting);
        }
        console.log(err);
      });
  }

  isLoggedIn(): boolean {
    return this.userService.isLoggedIn;
  }
  
  onOpenPanel(): void {
    this.socialService.updatedOnlineFriends();
  }

  getFriends(): User[] {
    const friends: User[] = [];

    if (this.onlineFriends == undefined){
      return friends
    }

    for (const friend of this.onlineFriends) {
      if (!this.gameRoom.value?.userIds.includes(friend.id)) {
        friends.push(friend);
      }
    }
    return friends;
  }

  inviteFriend(id: string): void {
    if (this.gameRoom.value) {
      this.commService.inviteFriendToGame(id, this.userService.currentUserValue.id, this.gameRoom.value.id).then(() => {
        console.log("invited");
      }).catch((err) => {
        console.log(err);
      });
    }
  }
}
