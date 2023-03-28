import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Packet } from '@app/utils/interfaces/packet';
import { Room } from '@app/utils/interfaces/room';
import { ChatMessage } from '@app/utils/interfaces/chat-message';
import { UserService } from '@app/services/user/user.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { User } from '@app/utils/interfaces/user';
import { RoomService } from '@app/services/room/room.service';
const electron = (window as any).require('electron');
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  globalRoomId!: string;
  user: BehaviorSubject<User>;

  constructor(
    private userService: UserService,
    private roomService: RoomService,
    private socketService: WebSocketService
  ) {
    this.user = this.userService.subjectUser;
  }

  send(msg: string, room: Room): void {
    console.log(this.roomService.listJoinedChatRooms.value);
    if (
      this.userService.isLoggedIn &&
      this.roomService.findRoom(room.id) !== undefined
    ) {
      const payload: ChatMessage = {
        roomId: room.id,
        from: this.user.value.username,
        fromId: this.user.value.id,
        message: msg,
      };
      this.socketService.send('chat-message', payload);
    } else {
      console.log('Not logged in');
    }
  }

  openChat(): any {
    const text = 'Hello World';
    electron.ipcRenderer.send('open-chat', text);
    electron.ipcRenderer.on('open-chat-reply', (event: any, arg: any) => {
      console.log(arg);
    });
  }
  closeChat(): any {
    const text = 'Hello World';
    electron.ipcRenderer.send('close-chat', text);
    electron.ipcRenderer.on('close-chat-reply', (event: any, arg: any) => {
      console.log(arg);
    });
  }
}
