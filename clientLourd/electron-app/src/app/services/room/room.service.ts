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
    currentRoomChat!: BehaviorSubject<Room>;
    listChatRooms!: BehaviorSubject<Room[]>;
    listJoinedChatRooms!: BehaviorSubject<Room[]>;
    //listJoinedDMRooms!: BehaviorSubject<Room[]>;

    constructor(private commService: CommunicationService, private userService: UserService) {
        this.listChatRooms = new BehaviorSubject<Room[]>([]);
        this.listJoinedChatRooms = new BehaviorSubject<Room[]>([]);
        //this.listJoinedDMRooms = new BehaviorSubject<Room[]>([]);
        this.currentRoomChat = new BehaviorSubject<Room>({
            id: "",
            name: "",
            userIds: [],
            messages: [],
        });
    }

    addRoom(room: Room): void {
        //console.log(room);
        console.log("room");
        console.log(room);
        this.listJoinedChatRooms.next([...this.listJoinedChatRooms.value, room]);
        const updatedChatRooms = this.userService.currentUserValue.joinedChatRooms;
        updatedChatRooms.push(room.id);
        this.userService.subjectUser.next({...this.userService.subjectUser.value, joinedChatRooms: updatedChatRooms});
        this.currentRoomChat.next(room);
    }

    /*addDMRoom(room: Room): void {
        this.listJoinedDMRooms.next([...this.listJoinedDMRooms.value, room]);
        const updatedDMRooms = this.userService.currentUserValue.joinedDMRooms;
        updatedDMRooms.push(room.id);
        this.userService.subjectUser.next({...this.userService.subjectUser.value, joinedDMRooms: updatedDMRooms});
        this.currentRoomChat.next(room);
    }*/

    removeRoom(roomID: string): void {
        const currentRooms = this.listChatRooms.getValue();
        const index = this.findRoom(roomID);
        if (index !== undefined)
            currentRooms.splice(index, 1);

        this.listChatRooms.next(currentRooms);
        const updatedChatRooms = this.userService.currentUserValue.joinedChatRooms;
        const indexChat = updatedChatRooms.indexOf(roomID, 0);
        if (indexChat > -1) {
            updatedChatRooms.splice(indexChat, 1);
        }
        this.userService.subjectUser.next({...this.userService.subjectUser.value, joinedChatRooms: updatedChatRooms});
        if (this.listChatRooms.value.length > 0)
            this.currentRoomChat.next(this.listChatRooms.value[0]);
    }

    changeRoom(roomId: string): void {
        const index = this.findRoom(roomId);
        if (index !== undefined)
            this.currentRoomChat.next(this.listJoinedChatRooms.value[index]);
    }

    addMessage(msg: ChatMessage): void {
        console.log(this.listJoinedChatRooms.value);
        if (msg.roomId== this.currentRoomChat.value.id) {
            const currentMessages = this.currentRoomChat.value.messages;
            currentMessages.push(msg);
            this.currentRoomChat.next({...this.currentRoomChat.value, messages: currentMessages});
        } else {
            const index = this.findRoom(msg.roomId);
            console.log(index);
            if (index !== undefined) {
                const newRooms = this.listJoinedChatRooms.value;
                newRooms[index].messages.push(msg);
                this.listJoinedChatRooms.next(newRooms);
            }
        }
    }

    findRoom(roomIdTocHeck: string): number | undefined {
        for (let i = 0; i < this.listJoinedChatRooms.value.length; i++) {
            if (this.listJoinedChatRooms.value[i].id == roomIdTocHeck)
                return i;         
        }
        return undefined;
    }

    addUser(roomId: string, userId: string): void {
        if (roomId == this.currentRoomChat.value.id) {
            const currentRoom = this.currentRoomChat.value;
            currentRoom.userIds = [...currentRoom.userIds, userId]
            this.currentRoomChat.next(currentRoom);
        } else {
            const rooms = this.listChatRooms.value;
            for (let i = 0; i < this.listChatRooms.value.length; i++) {
                if (rooms[i].id == roomId) {
                    rooms[i].userIds = [...rooms[i].userIds, userId];
                    this.listChatRooms.next(rooms);
                }
            }
        }
    }

    /*addUserDM(roomId: string, userId: string): void {
        if (roomId == this.currentRoomChat.value.id) {
            const currentRoom = this.currentRoomChat.value;
            currentRoom.userIds = [...currentRoom.userIds, userId]
            this.currentRoomChat.next(currentRoom);
        } else {
            const rooms = this.listJoinedDMRooms.value;
            for (let i = 0; i < this.listJoinedDMRooms.value.length; i++) {
                if (rooms[i].id == roomId) {
                    rooms[i].userIds = [...rooms[i].userIds, userId];
                    this.listJoinedDMRooms.next(rooms);
                }
            }
        }
    }*/

    removeUser(roomId: string, userId: string): void {
        if (roomId == this.currentRoomChat.value.id) {
            const currentUsers = this.currentRoomChat.value.userIds;
            const indexUser = currentUsers.indexOf(userId, 0);
            if (indexUser > -1) {
                currentUsers.splice(indexUser, 1);
                this.currentRoomChat.next({...this.currentRoomChat.value, userIds: currentUsers});
            }
        } else {
            const index = this.findRoom(roomId);
            if (index) {
                const rooms = this.listChatRooms.value;
                const indexUser = rooms[index].userIds.indexOf(userId, 0);
                if (indexUser > -1) {
                    rooms[index].userIds.splice(indexUser, 1);
                    if (rooms[index].userIds.length == 0) {
                        this.listChatRooms.value.splice(index, 1);
                    }
                    this.listChatRooms.next(rooms);
                }
            }
        }
    }
}