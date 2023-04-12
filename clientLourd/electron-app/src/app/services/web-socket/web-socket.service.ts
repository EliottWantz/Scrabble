/* eslint-disable prefer-const */
/* eslint-disable no-case-declarations */
import { Injectable } from '@angular/core';
import { UserService } from '@app/services/user/user.service';
import { User } from '@app/utils/interfaces/user';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ClientPayload,
  ErrorPayload,
  FirstMovePayload,
  FriendRequestPayload,
  GameOverPayload,
  GameUpdatePayload,
  InvitedToGamePayload,
  JoinedDMRoomPayload,
  JoinedGameAsObserverPayload,
  JoinedGamePayload,
  JoinedRoomPayload,
  LeftDMRoomPayload,
  LeftGamePayload,
  LeftRoomPayload,
  ListChatRoomsPayload,
  ListJoinableGamesPayload,
  ListObservableGamesPayload,
  ListUsersPayload,
  NewUserPayload,
  Packet,
  RevokeJoinGameRequestPayload,
  ServerIndicePayload,
  TimerUpdatePayload,
  UserJoinedDMRoomPayload,
  UserJoinedGamePayload,
  UserJoinedRoomPayload,
  UserLeftDMRoomPayload,
  UserLeftGamePayload,
  UserLeftRoomPayload,
  UserRequestToJoinGamePayload,
} from '@app/utils/interfaces/packet';
import { RoomService } from '@app/services/room/room.service';
import { ChatMessage } from '@app/utils/interfaces/chat-message';
import { ClientEvent } from '@app/utils/events/client-events';
import { ServerEvent } from '@app/utils/events/server-events';
import { GameService } from '@app/services/game/game.service';
import { StorageService } from '@app/services/storage/storage.service';
import { ScrabbleGame } from '@app/utils/interfaces/game/game';
import { Router } from '@angular/router';
import { Room } from '@app/utils/interfaces/room';
import { Square } from '@app/utils/interfaces/square';
import { Tile } from '@app/utils/interfaces/game/tile';
import { Player } from '@app/utils/interfaces/game/player';
import { SocialService } from '@app/services/social/social.service';
import { InviteService } from '@app/services/invite/invite.service';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  socket!: WebSocket;
  user: BehaviorSubject<User>;
  error: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(
    private userService: UserService,
    private roomService: RoomService,
    private gameService: GameService,
    private storageService: StorageService,
    private router: Router,
    private socialService: SocialService,
    private inviteService: InviteService
  ) {
    this.user = this.userService.subjectUser;
  }

  async connect(): Promise<void> {
    if (this.user) {
      this.socket = new WebSocket(
        `${environment.wsUrl}/?id=${this.user.value.id}&username=${this.user.value.username}`
      );

      this.socket.onopen = () => {
        this.socket.onmessage = (e) => {
          this.handleSocket(e);
        };
      };

      this.socket.onclose = () => {
        this.userService.deleteUser();
        this.router.navigate(['/home']);
      };
    }
  }

  disconnect(): void {
    this.socket.close();
    this.userService.deleteUser();
    this.router.navigate(['/home']);
  }

  private async handleSocket(e: MessageEvent): Promise<void> {
    const packet: Packet = JSON.parse(e.data);
    const event: ServerEvent = packet.event as ServerEvent;
    this.error.next('');

    switch (event) {
      case 'joinedRoom': {
        const payloadRoom = packet.payload as JoinedRoomPayload;
        const userIds = [];
        for (const id of payloadRoom.userIds) {
          userIds.push(id);
        }
        const messages = [];
        for (const message of payloadRoom.messages) {
          messages.push({
            ...message,
            timestamp: new Date(message.timestamp!).toLocaleTimeString(
              undefined,
              { hour12: false }
            ),
          });
        }
        const room = {
          id: payloadRoom.roomId,
          userIds: userIds,
          name: payloadRoom.roomName,
          messages: messages,
        };
        //console.log(room);
        //this.roomService.addRoom(room);
        if (this.roomService.findRoom(room.id) === undefined) {
          this.roomService.addRoom(room);
        }
        break;
      }

      case 'leftRoom': {
        const payloadLeftRoom = packet.payload as LeftRoomPayload;
        if (this.roomService.findRoom(payloadLeftRoom.roomId) !== undefined) {
          this.roomService.removeRoom(payloadLeftRoom.roomId);
        }
        break;
      }

      case 'userJoinedRoom': {
        const payloadUserJoinedRoom = packet.payload as UserJoinedRoomPayload;
        if (
          this.roomService.findRoom(payloadUserJoinedRoom.roomId) !== undefined
        ) {
          this.roomService.addUser(
            payloadUserJoinedRoom.roomId,
            payloadUserJoinedRoom.userId
          );
        }
        break;
      }

      case 'userLeftRoom': {
        const payloadUserLeftRoom = packet.payload as UserLeftRoomPayload;
        this.roomService.removeUser(
          payloadUserLeftRoom.roomId,
          payloadUserLeftRoom.userId
        );
        break;
      }

      case 'joinedDMRoom': {
        const payloadRoom = packet.payload as JoinedDMRoomPayload;
        const userIds = [];
        for (const id of payloadRoom.userIds) {
          userIds.push(id);
        }
        const messages = [];
        for (const message of payloadRoom.messages) {
          messages.push({
            ...message,
            timestamp: new Date(message.timestamp!).toLocaleTimeString(
              undefined,
              { hour12: false }
            ),
          });
        }
        const room = {
          id: payloadRoom.roomId,
          userIds: userIds,
          name: payloadRoom.roomName,
          messages: messages,
        };
        //this.roomService.addRoom(room);
        this.roomService.addRoom(room);
        /*if (this.roomService.findRoom(room.id) === undefined) {
                    this.roomService.addRoom(room);
                }*/
        break;
      }

      case 'leftDMRoom': {
        const payloadLeftRoom = packet.payload as LeftDMRoomPayload;
        this.roomService.removeRoom(payloadLeftRoom.roomId);
        break;
      }

      case 'userJoinedDMRoom': {
        const payloadUserJoinedRoom = packet.payload as UserJoinedDMRoomPayload;
        this.roomService.addUser(
          payloadUserJoinedRoom.roomId,
          payloadUserJoinedRoom.userId
        );
        break;
      }

      case 'userLeftDMRoom': {
        const payloadUserLeftRoom = packet.payload as UserLeftDMRoomPayload;
        this.roomService.removeUser(
          payloadUserLeftRoom.roomId,
          payloadUserLeftRoom.userId
        );
        break;
      }

      case 'listUsers': {
        const payloadListUsers = packet.payload as ListUsersPayload;
        this.storageService.listUsers.next(payloadListUsers.users);
        for (const user of payloadListUsers.users) {
          this.storageService.addAvatar(user.id, user.avatar.url);
        }
        break;
      }

      case 'newUser': {
        const newUserPayload = packet.payload as NewUserPayload;
        this.storageService.listUsers.next([
          ...this.storageService.listUsers.value,
          newUserPayload.user,
        ]);
        this.storageService.addAvatar(
          newUserPayload.user.id,
          newUserPayload.user.avatar.url
        );
        break;
      }

      case 'listChatRooms': {
        const listChatRoomsPayload = packet.payload as ListChatRoomsPayload;
        this.roomService.listChatRooms.next(listChatRoomsPayload.rooms);
        break;
      }

      case 'joinableGames': {
        const listJoinableGamesPayload =
          packet.payload as ListJoinableGamesPayload;
        this.gameService.joinableGames.next(listJoinableGamesPayload.games);
        break;
      }

      case 'joinedGame': {
        const joinedGamePayload = packet.payload as JoinedGamePayload;
        this.gameService.game.next(joinedGamePayload.game);
        const newRoom: Room = {
          id: joinedGamePayload.game.id,
          name: 'Game',
          userIds: joinedGamePayload.game.userIds,
          messages: [],
        };
        this.roomService.addRoom(newRoom);
        //this.roomService.currentRoomChat.next(newRoom);
        this.router.navigate(['/waitingRoom']);
        break;
      }

      case 'userJoinedGame': {
        const userJoinedGamePayload = packet.payload as UserJoinedGamePayload;
        this.gameService.addUser(
          userJoinedGamePayload.gameId,
          userJoinedGamePayload.userId
        );
        break;
      }

      case 'leftGame': {
        const leftGamePayload = packet.payload as LeftGamePayload;
        this.roomService.removeRoom(leftGamePayload.gameId);
        //this.gameService.removeUser(leftGamePayload.gameId, this.userService.currentUserValue.id);
        this.gameService.scrabbleGame.next(undefined);
        this.gameService.game.next(undefined);
        this.gameService.isObserving = false;

        // check if tournament
        this.router.navigate(['/home']);
        break;
      }

      case 'userLeftGame': {
        const userLeftGamePayload = packet.payload as UserLeftGamePayload;
        this.gameService.removeUser(
          userLeftGamePayload.gameId,
          userLeftGamePayload.userId
        );
        break;
      }

      case 'gameUpdate': {
        const payloadUpdateGame = packet.payload as GameUpdatePayload;
        const newBoard: Square[][] = payloadUpdateGame.game.board;
        for (let i = 0; i < payloadUpdateGame.game.board.length; i++) {
          for (let j = 0; j < payloadUpdateGame.game.board[i].length; j++) {
            if (payloadUpdateGame.game.board[i][j].tile) {
              //console.log("allo");
              console.log(payloadUpdateGame.game.board[i][j].tile);
              newBoard[i][j].tile = {
                ...(payloadUpdateGame.game.board[i][j].tile as Tile),
                disabled: true,
              };
            } else {
              newBoard[i][j].tile = {
                ...(payloadUpdateGame.game.board[i][j].tile as Tile),
                disabled: false,
              };
            }
          }
        }
        this.gameService.placedTiles = 0;
        this.gameService.selectedTiles = [];
        const newGame: ScrabbleGame = {
          ...payloadUpdateGame.game,
          board: newBoard,
        };
        this.gameService.updateGame(newGame);
        break;
      }

      case 'timerUpdate': {
        const payloadTimer = packet.payload as TimerUpdatePayload;
        this.gameService.updateTimer(payloadTimer.timer);
        break;
      }

      case 'gameOver': {
        const payloadGameOver = packet.payload as GameOverPayload;
        this.gameService.gameOverPopup(payloadGameOver.winnerId);
        break;
      }

      case 'friendRequest': {
        const payloadFriendRequest = packet.payload as FriendRequestPayload;
        this.userService.addFriendRequest(payloadFriendRequest.fromId);
        this.socialService.updatedPendingFriendRequest();
        break;
      }

      case 'acceptFriendRequest': {
        const payloadAcceptFriendRequest =
          packet.payload as FriendRequestPayload;
        this.userService.subjectUser.next({
          ...this.userService.currentUserValue,
          friends: [
            ...this.userService.currentUserValue.friends,
            payloadAcceptFriendRequest.fromId,
          ],
        });
        this.socialService.updatedOnlineFriends();
        break;
      }

      case 'declineFriendRequest': {
        const payloadDeclineFriendRequest =
          packet.payload as FriendRequestPayload;
        this.socialService.updatedOnlineFriends();
        break;
      }

      case 'indice': {
        const indicePayload = packet.payload as ServerIndicePayload;
        this.gameService.indice(indicePayload.moves);
        break;
      }

      case 'chat-message': {
        const payloadMessage = packet.payload as ChatMessage;
        const message: ChatMessage = {
          from: payloadMessage.from,
          fromId: payloadMessage.fromId,
          roomId: payloadMessage.roomId,
          message: payloadMessage.message,
          timestamp: new Date(payloadMessage.timestamp!).toLocaleTimeString(
            undefined,
            { hour12: false }
          ),
        };
        this.roomService.addMessage(message);
        break;
      }

      case 'observableGames': {
        const payload = packet.payload as ListObservableGamesPayload;
        this.gameService.observableGames.next(payload.games);
        break;
      }

      case 'userRequestToJoinGame': {
        const payload = packet.payload as UserRequestToJoinGamePayload;
        if (
          this.gameService.game.value &&
          this.gameService.game.value.id == payload.gameId &&
          this.gameService.game.value.userIds.length < 4 &&
          this.gameService.game.value.creatorId ==
          this.userService.currentUserValue.id
        ) {
          this.gameService.usersWaiting.next([
            ...this.gameService.usersWaiting.value,
            { userId: payload.userId, username: payload.username },
          ]);
        }
        break;
      }

      case 'userRequestToJoinGameAccepted': {
        break;
      }

      case 'userRequestToJoinGameDeclined': {
        this.gameService.wasDeclined.next(true);
        break;
      }

      case 'revokeRequestToJoinGame': {
        const payload = packet.payload as RevokeJoinGameRequestPayload;
        if (
          this.gameService.game.value &&
          this.gameService.game.value.id == payload.gameId
        ) {
          const newUsersWaiting = this.gameService.usersWaiting.value;
          for (const userWaiting of newUsersWaiting) {
            if (userWaiting.userId == payload.userId)
              newUsersWaiting.splice(newUsersWaiting.indexOf(userWaiting), 1);
          }
          this.gameService.usersWaiting.next(newUsersWaiting);
        }
        break;
      }

      case 'listOnlineUsers': {
        this.socialService.updatedOnlineFriends();
        console.log('listOnlineUsers' + this.socialService.onlineFriends$.value);
        break;
      }

      case 'joinedGameAsObserver': {
        const payload = packet.payload as JoinedGameAsObserverPayload;
        this.gameService.game.next(payload.game);
        this.gameService.scrabbleGame.next(payload.gameUpdate);
        break;
      }

      case 'first-square': {
        const payload = packet.payload as FirstMovePayload;
        if (
          this.gameService.scrabbleGame.value &&
          this.gameService.scrabbleGame.value.id === payload.gameId
        ) {
          const newBoard = this.gameService.scrabbleGame.value.board;
          newBoard[payload.coordinates.row][payload.coordinates.col].tile = {
            disabled: false,
            letter: 128,
            value: -1,
          } as Tile;
          console.log(
            newBoard[payload.coordinates.row][payload.coordinates.col]
          );
          this.gameService.scrabbleGame.next({
            ...this.gameService.scrabbleGame.value,
            board: newBoard,
          });
        }
        break;
      }

      case "remove-first-square": {
        const payload = packet.payload as FirstMovePayload;
        if (
          this.gameService.scrabbleGame.value &&
          this.gameService.scrabbleGame.value.id === payload.gameId
        ) {
          const newBoard = this.gameService.scrabbleGame.value.board;
          newBoard[payload.coordinates.row][payload.coordinates.col].tile = {
            disabled: false,
          } as Tile;
          this.gameService.scrabbleGame.next({
            ...this.gameService.scrabbleGame.value,
            board: newBoard,
          });
        }
        break;
      }

      case "invitedToGame": {
        const payload = packet.payload as InvitedToGamePayload;
        this.inviteService.createInvite(payload.inviterId, payload.game);
        break;
      }

      case 'error': {
        console.log('yellow');
        console.log(packet);
        const errorPayload = packet.payload as ErrorPayload;
        console.log(errorPayload);
        if (errorPayload.error == 'invalid move') {
          console.log('move');
          this.gameService.resetSelectedAndPlaced();
          //if (newGame) this.gameService.scrabbleGame.next(newGame);
          //this.gameService.game.next(this.gameService.game.value);
        } else {
          this.error.next(errorPayload.error);
        }
        break;
      }
    }
  }

  send(event: ClientEvent, payload: ClientPayload): void {
    const packet: Packet = {
      event: event,
      payload: payload,
    };
    this.socket.send(JSON.stringify(packet));
  }
}
