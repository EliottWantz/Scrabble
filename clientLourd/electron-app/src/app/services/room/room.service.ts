import { Injectable } from "@angular/core";
import { Room } from "@app/utils/interfaces/room";
import { BehaviorSubject } from "rxjs";
import { CommunicationService } from "@app/services/communication/communication.service"
import { UserService } from "@app/services/user/user.service";
import { ChatMessage } from "@app/utils/interfaces/chat-message";
import { User } from "@app/utils/interfaces/user";

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    rooms!: BehaviorSubject<Room[]>;
    currentRoomChat!: BehaviorSubject<Room>;
    joinableGames!: BehaviorSubject<Room[]>;
    listChatRooms!: BehaviorSubject<Room[]>;
    currentGameRoom!: BehaviorSubject<Room>;

    constructor(private commService: CommunicationService, private userService: UserService) {
        this.rooms = new BehaviorSubject<Room[]>([]);
        this.currentRoomChat = new BehaviorSubject<Room>({
            id: "",
            userIds: [],
            messages: [],
            creatorId : "",
            isGameRoom: false
        });
        this.currentGameRoom = new BehaviorSubject<Room>({
            id: "",
            userIds: [],
            messages: [],
            creatorId : "",
            isGameRoom: true
        });
        this.joinableGames = new BehaviorSubject<Room[]>([]);
        this.listChatRooms = new BehaviorSubject<Room[]>([]);
    }

    async joinRoom(roomId: string, roomName: string): Promise<void> {
    }

    addRoom(room: Room): void {
        //console.log(room);
        console.log("room");
        console.log(room);
        this.rooms.next([...this.rooms.value, room]);
        if (room.isGameRoom) {
            this.currentGameRoom.next(room);
        } else {
            this.currentRoomChat.next(room);
        }
    }

    removeRoom(roomID: string): void {
        const currentRooms = this.rooms.getValue();
        const index = this.findRoom(roomID);
        if (index !== undefined)
            currentRooms.splice(index, 1);

        this.rooms.next(currentRooms);
    }

    changeRoom(roomId: string): void {
        const index = this.findRoom(roomId);
        if (index !== undefined)
            this.currentRoomChat.next(this.rooms.value[index]);
    }

    addMessage(msg: ChatMessage): void {
        if (msg.roomId== this.currentRoomChat.value.id) {
            const currentMessages = this.currentRoomChat.value.messages;
            currentMessages.push(msg);
            this.currentRoomChat.next({...this.currentRoomChat.value, messages: currentMessages});
        } else if (msg.roomId== this.currentGameRoom.value.id) {
            const currentMessages = this.currentGameRoom.value.messages;
            currentMessages.push(msg);
            this.currentGameRoom.next({...this.currentGameRoom.value, messages: currentMessages});
        } else {
            const index = this.findRoom(msg.roomId);
            if (index) {
                const currentMessages = this.rooms.value[index].messages;
                currentMessages.push(msg);
                const newRooms = this.rooms.value;
                newRooms[index] = {...newRooms[index], messages: currentMessages};
                this.rooms.next(newRooms);
            }
        }
    }

    findRoom(roomIdTocHeck: string): number | undefined {
        for (let i = 0; i < this.rooms.value.length; i++) {
            if (this.rooms.value[i].id == roomIdTocHeck)
                return i;         
        }
        return undefined;
    }

    findGame(roomIdTocHeck: string): number | undefined {
        for (let i = 0; i < this.joinableGames.value.length; i++) {
            if (this.joinableGames.value[i].id == roomIdTocHeck)
                return i;         
        }
        return undefined;
    }

    addUser(roomId: string, user: User): void {
        if (roomId == this.currentRoomChat.value.id) {
            const currentRoom = this.currentRoomChat.value;
            currentRoom.userIds = [...currentRoom.userIds, user.id]
            this.currentRoomChat.next(currentRoom);
        } else if (roomId == this.currentGameRoom.value.id) {
            const currentGameRoom = this.currentGameRoom.value;
            currentGameRoom.userIds = [...currentGameRoom.userIds, user.id]
            this.currentGameRoom.next(currentGameRoom);
        } else {
            const rooms = this.rooms.value;
            for (let i = 0; i < this.rooms.value.length; i++) {
                if (rooms[i].id == roomId) {
                    rooms[i].userIds = [...rooms[i].userIds, user.id];
                    this.rooms.next(rooms);
                }
            }
        }
    }
}