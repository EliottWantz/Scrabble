/* eslint-disable prefer-const */
/* eslint-disable no-case-declarations */
import { Injectable } from "@angular/core";
import { UserService } from "@app/services/user/user.service";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";
import { environment } from 'src/environments/environment';
import { ClientPayload, ErrorPayload, FriendRequestPayload, GameOverPayload, GameUpdatePayload, JoinedDMRoomPayload, JoinedGamePayload, JoinedRoomPayload, LeftDMRoomPayload, LeftGamePayload, LeftRoomPayload, ListChatRoomsPayload, ListJoinableGamesPayload, ListUsersPayload, NewUserPayload, Packet, ServerIndicePayload, TimerUpdatePayload, UserJoinedDMRoomPayload, UserJoinedGamePayload, UserJoinedRoomPayload, UserLeftDMRoomPayload, UserLeftGamePayload, UserLeftRoomPayload } from "@app/utils/interfaces/packet";
import { RoomService } from "@app/services/room/room.service";
import { ChatMessage } from "@app/utils/interfaces/chat-message";
import { ClientEvent } from "@app/utils/events/client-events";
import { ServerEvent } from "@app/utils/events/server-events";
import { GameService } from "@app/services/game/game.service";
import { RackService } from "@app/services/game/rack.service";
import { StorageService } from "@app/services/storage/storage.service";
import { ScrabbleGame } from "@app/utils/interfaces/game/game";

@Injectable({
    providedIn: "root",
})
export class WebSocketService {
    socket!: WebSocket;
    user: BehaviorSubject<User>;

    constructor(private userService: UserService, private roomService: RoomService, private gameService: GameService, private rackService: RackService, private storageService: StorageService) {
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
                }
            }  
        }
    }

    disconnect(): void {
        this.socket.close();
        this.userService.deleteUser();
    }

    private async handleSocket(e: MessageEvent): Promise<void> {
        const packet: Packet = JSON.parse(e.data);
        const event: ServerEvent = packet.event as ServerEvent;

        switch (event) {
            case "joinedRoom": {
                const payloadRoom = packet.payload as JoinedRoomPayload;
                const userIds = [];
                for (const id of payloadRoom.userIds) {
                    userIds.push(id);
                }
                const room = {
                    id: payloadRoom.roomId,
                    userIds: userIds,
                    name: payloadRoom.roomName,
                    messages: payloadRoom.messages,
                }
                console.log(room);
                //this.roomService.addRoom(room);
                if (this.roomService.findRoom(room.id) === undefined) {
                    this.roomService.addRoom(room);
                }
                break;
            }

            case "leftRoom": {
                const payloadLeftRoom = packet.payload as LeftRoomPayload;
                if (this.roomService.findRoom(payloadLeftRoom.roomId) !== undefined) {
                    this.roomService.removeRoom(payloadLeftRoom.roomId);
                }
                break;
            }

            case "userJoinedRoom": {
                const payloadUserJoinedRoom = packet.payload as UserJoinedRoomPayload;
                if (this.roomService.findRoom(payloadUserJoinedRoom.roomId) !== undefined) {
                    this.roomService.addUser(payloadUserJoinedRoom.roomId, payloadUserJoinedRoom.userId);
                }
                break;
            }

            case "userLeftRoom": {
                const payloadUserLeftRoom = packet.payload as UserLeftRoomPayload;
                this.roomService.removeUser(payloadUserLeftRoom.roomId, payloadUserLeftRoom.userId);
                break;
            }

            case "joinedDMRoom": {
                const payloadRoom = packet.payload as JoinedDMRoomPayload;
                const userIds = [];
                for (const id of payloadRoom.userIds) {
                    userIds.push(id);
                }
                const room = {
                    id: payloadRoom.roomId,
                    userIds: userIds,
                    name: payloadRoom.roomName,
                    messages: payloadRoom.messages,
                }
                //this.roomService.addRoom(room);
                if (this.roomService.findRoom(room.id) === undefined) {
                    this.roomService.addRoom(room);
                }
                break;
            }

            case "leftDMRoom": {
                const payloadLeftRoom = packet.payload as LeftDMRoomPayload;
                if (this.roomService.findRoom(payloadLeftRoom.roomId) !== undefined) {
                    this.roomService.removeRoom(payloadLeftRoom.roomId);
                }
                break;
            }

            case "userJoinedDMRoom": {
                const payloadUserJoinedRoom = packet.payload as UserJoinedDMRoomPayload;
                if (this.roomService.findRoom(payloadUserJoinedRoom.roomId) !== undefined) {
                    this.roomService.addUser(payloadUserJoinedRoom.roomId, payloadUserJoinedRoom.userId);
                }
                break;
            }

            case "userLeftDMRoom": {
                const payloadUserLeftRoom = packet.payload as UserLeftDMRoomPayload;
                this.roomService.removeUser(payloadUserLeftRoom.roomId, payloadUserLeftRoom.userId);
                break;
            }

            case "listUsers": {
                const payloadListUsers = packet.payload as ListUsersPayload;
                this.storageService.listUsers = payloadListUsers.users;
                break;
            }

            case "newUser": {
                const newUserPayload = packet.payload as NewUserPayload;
                this.storageService.listUsers.push(newUserPayload.user);
                break;
            }

            case "listChatRooms": {
                const listChatRoomsPayload = packet.payload as ListChatRoomsPayload;
                this.roomService.listChatRooms.next(listChatRoomsPayload.rooms);
                break;
            }

            case "joinableGames": {
                const listJoinableGamesPayload = packet.payload as ListJoinableGamesPayload;
                this.gameService.joinableGames.next(listJoinableGamesPayload.games);
                break;
            }

            case "joinedGame": {
                const joinedGamePayload = packet.payload as JoinedGamePayload;
                this.gameService.game.next(joinedGamePayload.game);
                break;
            }

            case "userJoinedGame": {
                const userJoinedGamePayload = packet.payload as UserJoinedGamePayload;
                this.gameService.addUser(userJoinedGamePayload.gameId, userJoinedGamePayload.userId);
                break;
            }

            case "leftGame": {
                const leftGamePayload = packet.payload as LeftGamePayload;
                this.gameService.removeUser(leftGamePayload.gameId, this.userService.currentUserValue.id);
                break;
            }

            case "userLeftGame": {
                const userLeftGamePayload = packet.payload as UserLeftGamePayload;
                this.gameService.removeUser(userLeftGamePayload.gameId, userLeftGamePayload.userId);
                break;
            }

            case "gameUpdate": {
                const payloadUpdateGame = packet.payload as GameUpdatePayload;
                this.gameService.updateGame(payloadUpdateGame.game);
                this.rackService.deleteRecycled();
                break;
            }

            case "timerUpdate": {
                const payloadTimer = packet.payload as TimerUpdatePayload;
                this.gameService.updateTimer(payloadTimer.timer);
                break;
            }

            case "gameOver": {
                const payloadGameOver = packet.payload as GameOverPayload;
                break;
            }

            case "friendRequest": {
                const payloadFriendRequest = packet.payload as FriendRequestPayload;
                break;
            }

            case "acceptFriendRequest": {
                const payloadAcceptFriendRequest = packet.payload as FriendRequestPayload;
                break;
            }

            case "declineFriendRequest": {
                const payloadDeclineFriendRequest = packet.payload as FriendRequestPayload;
                break;
            }

            case "indice": {
                const indicePayload = packet.payload as ServerIndicePayload;
                this.gameService.moves.next(indicePayload.moves);
                break;
            }
    
            case "chat-message": {
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

            case "error": {
                console.log("yellow");
                console.log(packet);
                const errorPayload = packet.payload as ErrorPayload;
                console.log(errorPayload);
                if (errorPayload.error == "invalid move") {
                    this.rackService.replaceTilesInRack();
                    //this.gameService.game.next(this.gameService.game.value);
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