import { Injectable } from "@angular/core";
import { UserService } from "@app/services/user/user.service";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";
import { environment } from 'src/environments/environment';
import { ClientPayload, CreateRoomPayload, JoinableGamesPayload, JoinDMPayload, JoinedRoomPayload, JoinRoomPayload, LeaveRoomPayload, Packet, PlayMovePayload } from "@app/utils/interfaces/packet";
import { RoomService } from "@app/services/room/room.service";
import { Room } from "@app/utils/interfaces/room";
import { ChatMessage } from "@app/utils/interfaces/chat-message";
import { ClientEvent } from "@app/utils/events/client-events";
import { ServerEvent } from "@app/utils/events/server-events";
import { GameService } from "@app/services/game/game.service";
import { Game } from "@app/utils/interfaces/game/game";

@Injectable({
    providedIn: "root",
})
export class WebSocketService {
    socket!: WebSocket;
    user: BehaviorSubject<User>;

    constructor(private userService: UserService, private roomService: RoomService, private gameService: GameService) {
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
                const room = {
                    id: payloadRoom.roomId,
                    userIds: payloadRoom.users,
                    messages: payloadRoom.messages,
                    creatorId: payloadRoom.creatorID,
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
                const payloadGame = packet.payload as Game;
                this.gameService.updateGame(payloadGame);
                break;
            case "joinableGames":
                //console.log(packet.payload)
                const joinableGames = packet.payload as JoinableGamesPayload;
                //if(joinableGames[0] == undefined) return;
                //console.log(joinableGames);
                this.roomService.joinableGames.next(joinableGames.games);
                //console.log(this.roomService.rooms);
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