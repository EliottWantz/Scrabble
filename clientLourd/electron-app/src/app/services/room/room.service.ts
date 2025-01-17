import { Injectable } from '@angular/core';
import { Room } from '@app/utils/interfaces/room';
import { BehaviorSubject } from 'rxjs';
import { CommunicationService } from '@app/services/communication/communication.service';
import { UserService } from '@app/services/user/user.service';
import { ChatMessage } from '@app/utils/interfaces/chat-message';
import { User } from '@app/utils/interfaces/user';
const electron = (window as any).require('electron');
@Injectable({
  providedIn: 'root',
})
export class RoomService {
  currentRoomChat!: BehaviorSubject<Room>;
  listChatRooms!: BehaviorSubject<Room[]>;
  listJoinedChatRooms!: BehaviorSubject<Room[]>;
  //listJoinedDMRooms!: BehaviorSubject<Room[]>;

  constructor(
    private commService: CommunicationService,
    private userService: UserService
  ) {
    this.listChatRooms = new BehaviorSubject<Room[]>([]);
    this.listJoinedChatRooms = new BehaviorSubject<Room[]>([]);
    //this.listJoinedDMRooms = new BehaviorSubject<Room[]>([]);
    this.currentRoomChat = new BehaviorSubject<Room>({
      id: '',
      name: '',
      userIds: [],
      messages: [],
    });
  }

  addRoom(room: Room): void {
    console.log(room);
    this.listJoinedChatRooms.next([...this.listJoinedChatRooms.value, room]);
    const updatedChatRooms = this.userService.currentUserValue.joinedChatRooms;
    updatedChatRooms.push(room.id);
    this.userService.subjectUser.next({
      ...this.userService.subjectUser.value,
      joinedChatRooms: updatedChatRooms,
    });
    this.currentRoomChat.next(room);
    electron.ipcRenderer.send('get-room');
    electron.ipcRenderer.on('get-room-reply', (_: any, data: { _: User, room: Room }) => {
      console.log("has gotten room", data.room);
      this.currentRoomChat.next(data.room);
    });
  }

  removeRoom(roomID: string): void {
    const joinedRooms = this.listJoinedChatRooms.getValue();
    const index = this.findRoom(roomID);
    if (index !== undefined) joinedRooms.splice(index, 1);

    this.listJoinedChatRooms.next(joinedRooms);
    const updatedChatRooms = this.userService.currentUserValue.joinedChatRooms;
    const indexChat = updatedChatRooms.indexOf(roomID, 0);
    if (indexChat > -1) updatedChatRooms.splice(indexChat, 1);

    this.userService.subjectUser.next({
      ...this.userService.subjectUser.value,
      joinedChatRooms: updatedChatRooms,
    });
    if (this.listJoinedChatRooms.value.length > 0)
      this.currentRoomChat.next(this.listJoinedChatRooms.value[0]);
  }

  changeRoom(roomId: string): void {
    const index = this.findRoom(roomId);
    if (index !== undefined)
      this.currentRoomChat.next(this.listJoinedChatRooms.value[index]);
  }

  changeDMRoom(friendName: string): void {
    for (const room of this.listJoinedChatRooms.value) {
      if (
        room.name ==
        this.userService.currentUserValue.username + '/' + friendName ||
        room.name ==
        friendName + '/' + this.userService.currentUserValue.username
      ) {
        console.log('changed room to dm');
        this.currentRoomChat.next(room);
        return;
      }
    }
  }

  addMessage(msg: ChatMessage): void {
    if (msg.roomId == this.currentRoomChat.value.id) {
      const currentMessages = this.currentRoomChat.value.messages;
      currentMessages.push(msg);
      this.currentRoomChat.next({
        ...this.currentRoomChat.value,
        messages: currentMessages,
      });
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
      if (this.listJoinedChatRooms.value[i].id == roomIdTocHeck) return i;
    }
    return undefined;
  }

  getRoom(roomIdTocHeck: string): Room | undefined {
    for (let i = 0; i < this.listJoinedChatRooms.value.length; i++) {
      if (this.listJoinedChatRooms.value[i].id == roomIdTocHeck)

        return this.listJoinedChatRooms.value[i];
    }
    return undefined;
  }

  addUser(roomId: string, userId: string): void {
    if (roomId == this.currentRoomChat.value.id) {
      const currentRoom = this.currentRoomChat.value;
      currentRoom.userIds = [...currentRoom.userIds, userId];
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

  removeUser(roomId: string, userId: string): void {
    if (roomId == this.currentRoomChat.value.id) {
      const currentUsers = this.currentRoomChat.value.userIds;
      const indexUser = currentUsers.indexOf(userId, 0);
      if (indexUser > -1) {
        currentUsers.splice(indexUser, 1);
        this.currentRoomChat.next({
          ...this.currentRoomChat.value,
          userIds: currentUsers,
        });
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
