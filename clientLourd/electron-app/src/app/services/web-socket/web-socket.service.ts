import { Injectable } from "@angular/core";
import { StorageService } from "../storage/storage.service";
import { User } from "@app/utils/interfaces/user";
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: "root",
})
export class WebsocketService {
    socket!: WebSocket;
    room!: string;

    constructor(private storageService: StorageService) {}

    async connect(): Promise<void> {
        const user: User | null = this.storageService.getUser();
        if (user) {
            this.socket = new WebSocket(
                `${environment.wsUrl}/?id=` + user.id
            );
        }
    }

    disconnect(): void {
        this.socket.close.bind(this.socket);
    }
}