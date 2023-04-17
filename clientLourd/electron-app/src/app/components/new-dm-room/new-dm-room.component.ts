import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SocialService } from '@app/services/social/social.service';
import { StorageService } from '@app/services/storage/storage.service';
import { UserService } from '@app/services/user/user.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { ClientEvent } from '@app/utils/events/client-events';
import { CreateRoomPayload } from '@app/utils/interfaces/packet';
import { User } from '@app/utils/interfaces/user';

@Component({
  selector: 'app-new-dm-room',
  templateUrl: './new-dm-room.component.html',
  styleUrls: ['./new-dm-room.component.scss']
})
export class NewDmRoomComponent {
  chatroomName = '';
  friendName = '';
  errorMessage = '';
  friendGroup: string[] = []
  constructor(private socketService: WebSocketService, private dialogRef: MatDialogRef<void>
    , public socialService: SocialService) { }

  submit() {
    if (this.friendGroup.length === 0) {
      return;
    }
    const payload: CreateRoomPayload = {
      roomName: this.chatroomName,
      userIds: this.friendGroup
    };

    const event: ClientEvent = 'create-room';
    this.socketService.send(event, payload);
    this.dialogRef.close();
  }

  getFriends() {
    const friend = this.socialService.friendsList$.value.find((friend: User) => friend.username === this.friendName);
    if (!friend) {
      this.errorMessage = "This user is not in your friend list.";
      return;
    }
    this.errorMessage = '';
    this.friendGroup.push(friend.id);
    this.friendName = '';
  }

  getAllFriendGroupInfo() {
    return this.socialService.friendsList$.value.filter((friend: User) => this.friendGroup.includes(friend.id));
  }

  removeFriend(index: number) {
    this.friendGroup.splice(index, 1);
  }

  userOnline(username: string): boolean {
    if (!this.socialService.onlineFriends$.value) {
      return false;
    }
    return this.socialService.onlineFriends$.value.some((user) => { return user.username == username });
  }

}
