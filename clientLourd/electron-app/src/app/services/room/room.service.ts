import { Injectable } from "@angular/core";
import { Room } from "@app/utils/interfaces/room";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    rooms!: BehaviorSubject<Room[]>;
    currentRoom!: BehaviorSubject<Room>;
    constructor() {
        this.rooms = new BehaviorSubject<Room[]>([]);
    }

    addRoom(room: Room): void {
        this.rooms.next([...this.rooms.value, room]);
    }

    removeRoom(roomID: string): void {
        const currentRooms = this.rooms.getValue();
        currentRooms.forEach((room, index) => {
            if (room.ID == roomID) {
                currentRooms.splice(index, 1);
            }
        });

        this.rooms.next(currentRooms);
    }
}