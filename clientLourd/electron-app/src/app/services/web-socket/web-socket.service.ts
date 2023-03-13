import { Injectable } from "@angular/core";
import { UserService } from "@app/services/user/user.service";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";
import { environment } from 'src/environments/environment';
import { ClientPayload, CreateRoomPayload, ErrorPayload, GameUpdatePayload, IndiceServerPayload, JoinableGamesPayload, JoinDMPayload, JoinedRoomPayload, JoinRoomPayload, LeaveRoomPayload, Packet, PlayMovePayload, TimerUpdatePayload, UserJoinedPayload } from "@app/utils/interfaces/packet";
import { RoomService } from "@app/services/room/room.service";
import { Room } from "@app/utils/interfaces/room";
import { ChatMessage } from "@app/utils/interfaces/chat-message";
import { ClientEvent } from "@app/utils/events/client-events";
import { ServerEvent } from "@app/utils/events/server-events";
import { GameService } from "@app/services/game/game.service";
import { Game } from "@app/utils/interfaces/game/game";
import { RackService } from "@app/services/game/rack.service";

@Injectable({
    providedIn: "root",
})
export class WebSocketService {
    socket!: WebSocket;
    user: BehaviorSubject<User>;

    constructor(private userService: UserService, private roomService: RoomService, private gameService: GameService, private rackService: RackService) {
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
            case "joinedRoom":
                const payloadRoom = packet.payload as JoinedRoomPayload;
                const userIds = [];
                for (let user of payloadRoom.users) {
                    userIds.push(user.id);
                }
                const room = {
                    id: payloadRoom.roomId,
                    userIds: userIds,
                    messages: payloadRoom.messages,
                    creatorId: payloadRoom.creatorId,
                    isGameRoom: payloadRoom.isGameRoom
                }
                //this.roomService.addRoom(room);
                if (this.roomService.findRoom(room.id) === undefined) {
                    this.roomService.addRoom(room);
                }
                break;
    
            case "chat-message":
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
    
            case "listUsers":
                break;

            case "listChatRooms":
                break;

            case "gameUpdate":
                const payloadGame = packet.payload as GameUpdatePayload;
                this.gameService.updateGame(payloadGame);
                break;

            case "joinableGames":
                //console.log(packet.payload)
                const joinableGames = packet.payload as JoinableGamesPayload;
                //if(joinableGames[0] == undefined) return;
                //console.log(joinableGames);
                this.roomService.joinableGames.next(joinableGames.games);
                //console.log(this.roomService.rooms);
                break;

            case "timerUpdate":
                const payloadTimer = packet.payload as TimerUpdatePayload;
                this.gameService.updateTimer(payloadTimer.timer);
                break;

            case "userJoined":
                const payloadUserJoined = packet.payload as UserJoinedPayload;
                this.roomService.addUser(payloadUserJoined.roomId, payloadUserJoined.user);
                break;

            case "error":
                console.log("yellow");
                console.log(packet);
                const errorPayload = packet.payload as ErrorPayload;
                console.log(errorPayload);
                if (errorPayload.error == "invalid move") {
                    this.rackService.replaceTilesInRack();
                    //this.gameService.game.next(this.gameService.game.value);
                }
                break;

            case "indice":
                const indicePayload = packet.payload as IndiceServerPayload;
                this.gameService.moves.next(indicePayload.moves);
                break;
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