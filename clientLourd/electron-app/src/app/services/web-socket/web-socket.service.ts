import { Injectable } from "@angular/core";
import { AuthenticationService } from "@app/services/authentication/authentication.service";
import { User } from "@app/utils/interfaces/user";
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: "root",
})
export class WebsocketService {
    socket!: WebSocket;
    room!: string;

    constructor(private authService: AuthenticationService) {}

    async connect(): Promise<void> {
        const user: User = this.authService.currentUserValue;
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