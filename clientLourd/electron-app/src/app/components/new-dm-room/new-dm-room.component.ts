import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommunicationService } from '@app/services/communication/communication.service';
import { StorageService } from '@app/services/storage/storage.service';
import { UserService } from '@app/services/user/user.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { ClientEvent } from '@app/utils/events/client-events';
import { CreateDMRoomPayload } from '@app/utils/interfaces/packet';
import { User } from '@app/utils/interfaces/user';

@Component({
  selector: 'app-new-dm-room',
  templateUrl: './new-dm-room.component.html',
  styleUrls: ['./new-dm-room.component.scss']
})
export class NewDmRoomComponent {
  chatroomName = '';
  friendName = '';

  constructor(private socketService: WebSocketService, private userService: UserService, private storageSercice: StorageService, private dialogRef: MatDialogRef<void>) { }
  submit() {
    const friend = this.storageSercice.getUserFromName(this.friendName) as User
    if (friend) {

      const payload: CreateDMRoomPayload = {
        username: this.userService.subjectUser.value.username,
        toId: friend.id,
        toUsername: this.friendName,
      };
      const event: ClientEvent = 'create-dm-room';
      this.socketService.send(event, payload);
      this.dialogRef.close();
    }
  }
}

