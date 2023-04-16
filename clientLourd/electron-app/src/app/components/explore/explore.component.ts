import { Component } from '@angular/core';
import { RoomService } from '@app/services/room/room.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { ClientEvent } from '@app/utils/events/client-events';
import { JoinRoomPayload, LeaveRoomPayload } from '@app/utils/interfaces/packet';
import { Room } from '@app/utils/interfaces/room';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent {

  searchInput = '';
  constructor(public roomService: RoomService, private socketService: WebSocketService) { }


  getPublicRooms(): Room[] {
    return this.roomService.listChatRooms.value.filter((room) => !room.name.includes('/'));
  }

  filterPublicRooms(): Room[] {
    return this.getPublicRooms().filter((room) =>
      room.name.toLowerCase().includes(this.searchInput.toLowerCase())
    );
  }


  joinRoom(room: Room) {
    console.log("Joining room: " + room.id)
    const payload: JoinRoomPayload = {
      roomId: room.id
    };

    const event: ClientEvent = 'join-room';
    this.socketService.send(event, payload);
  }

  leaveRoom(room: Room) {
    console.log("leaving room: " + room.id)
    const payload: LeaveRoomPayload = {
      roomId: room.id
    }
    const event: ClientEvent = 'leave-room';
    this.socketService.send(event, payload);
  }

  isJoined(idx: number): boolean {
    const room = this.getPublicRooms()[idx];
    return this.roomService.listJoinedChatRooms.value.some((joinedRoom) => joinedRoom.id === room.id);
  }
}