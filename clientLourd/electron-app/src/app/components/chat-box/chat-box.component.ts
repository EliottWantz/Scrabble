import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import * as forms from '@angular/forms';
import { ChatService } from '@app/services/chat/chat.service';
import { BehaviorSubject } from 'rxjs';
import { User } from '@app/utils/interfaces/user';
import { RoomService } from '@app/services/room/room.service';
import { Room } from '@app/utils/interfaces/room';
import { UserService } from '@app/services/user/user.service';
import { StorageService } from '@app/services/storage/storage.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { ClientEvent } from '@app/utils/events/client-events';
import { LeaveRoomPayload } from '@app/utils/interfaces/packet';
import { MatSelectChange } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { GifComponent } from '@app/components/gif/gif.component';
import { NewDmRoomComponent } from '../new-dm-room/new-dm-room.component';

const electron = (window as any).require('electron');

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements AfterViewInit {
  @ViewChild('chatBoxBody')
  chatBoxMessagesContainer!: ElementRef;
  fenetrer = false;
  showbutton = true;
  room$!: BehaviorSubject<Room>;
  ws!: WebSocket;
  @ViewChild('chatBoxInput')
  chatBoxInput!: ElementRef;
  user!: User;
  currentRoomId = '';
  message = '';
  roomsFormControl = new forms.FormControl();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private scrollTimeoutId: any;
  private roomSubscription!: Subscription;

  constructor(
    private fb: forms.FormBuilder,
    public chatService: ChatService,
    private roomService: RoomService,
    private userService: UserService,
    private storageService: StorageService,
    private socketService: WebSocketService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog
  ) {
    this.room$ = this.roomService.currentRoomChat;
    this.currentRoomId = this.room$.value.id;
    this.user = this.userService.currentUserValue;
    this.fenetrer = false;
    this.subscribeToRoom();
    electron.ipcRenderer.on('user-data', async (_: string, data: { user: User, room: Room }) => {
      this.ngZone.run(() => {
        this.showbutton = false;
      });
      this.roomService.currentRoomChat.next(data.room);
    });
    electron.ipcRenderer.on('open-chat', async () => {
      this.ngZone.run(() => {
        this.fenetrer = true;
      });
      this.roomSubscription.unsubscribe();
      clearTimeout(this.scrollTimeoutId);
    });
    electron.ipcRenderer.on('close-chat', async () => {
      this.ngZone.run(() => {

        this.fenetrer = false;
        this.subscribeToRoom();
      });
    });
  }

  async ngAfterViewInit(): Promise<void> {
    setTimeout(() => {
      this.chatBoxInput.nativeElement.focus();
      this.scrollToBottom();
    });

    this.room$.subscribe(() => {
      this.scrollToBottom();
    });
  }

  send(event: Event): void {
    event.preventDefault();
    if (!this.message || !this.message.replace(/\s/g, '')) return;

    this.chatService.send(this.message, this.roomService.currentRoomChat.value);
    this.message = '';
    this.scrollToBottom();
  }

  getAvatarMessage(id: string): string {
    const avatar = this.storageService.getAvatar(id);
    if (avatar) return avatar;
    return '';
  }

  getRooms(): Room[] {
    return this.roomService.listJoinedChatRooms.value;
  }

  getRoomName(id: string): string {
    if (id == 'global') return 'Global Room';
    for (const room of this.roomService.listChatRooms.value) {
      if (room.id === id) return room.name;
    }
    return '';
  }

  changeRoom(event: MatSelectChange): void {
    this.roomService.changeRoom(this.currentRoomId);
  }

  leaveRoom(index: number): void {
    const roomClicked = this.roomService.listJoinedChatRooms.value[index];
    const payload: LeaveRoomPayload = {
      roomId: roomClicked.id,
    };
    let event: ClientEvent;
    if (
      roomClicked.name.includes(
        `${this.userService.currentUserValue.username}/`
      ) ||
      roomClicked.name.includes(
        `/${this.userService.currentUserValue.username}`
      )
    ) {
      event = 'leave-dm-room';
    } else {
      event = 'leave-room';
    }
    this.roomService.currentRoomChat.next(
      this.roomService.listJoinedChatRooms.value[0]
    );
    this.socketService.send(event, payload);
  }

  openGifMenu(): void {
    this.dialog.open(GifComponent, {});
  }

  containsGifURL(message: string): boolean {
    if (((message.includes('http://') || message.includes('https://')) && message.endsWith('.gif')) || message.includes("giphy.com")) {
      return true;
    }
    return false
  }

  getGifMessage(message: string): string[] {
    const words = message.split(' ');
    let messageNoUrl = "";
    let gif = "";
    for (const word of words) {
      if (((word.includes('http://') || word.includes('https://')) && message[message.length - 1] == 'f' && message[message.length - 2] == 'i' && message[message.length - 3] == 'g') || word.includes("giphy.com")) {
        gif = word;
      } else {
        messageNoUrl += word + " ";
      }
    }
    return [messageNoUrl, gif];
  }

  private subscribeToRoom(): void {
    this.roomSubscription = this.room$.subscribe(() => {
      this.currentRoomId = this.room$.value.id;
      this.scrollTimeoutId = setTimeout(() => {
        this.scrollToBottom();
      });
    });
  }
  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatBoxMessagesContainer) {
        const chatBox = this.chatBoxMessagesContainer.nativeElement;
        chatBox.scrollTop = chatBox.scrollHeight;
        this.cdr.detectChanges();
      }
    });
  }
}
