import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { GameService } from "@app/services/game/game.service";
import { StorageService } from "@app/services/storage/storage.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { ClientEvent } from "@app/utils/events/client-events";
import { Game } from "@app/utils/interfaces/game/game";
import { Tournament } from "@app/utils/interfaces/game/tournament";
import { CreateTournamentPayload} from "@app/utils/interfaces/packet";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: "app-create-tournament",
    templateUrl: "./create-tournament.component.html",
    styleUrls: ["./create-tournament.component.scss"],
})
export class CreateTournamentComponent {
    tournaments: BehaviorSubject<Tournament[]>;
    password = "";
    gameType = "Public";
    gameTypes = ["Public", "Protected", "Private"];
    constructor(public dialogRef: MatDialogRef<CreateTournamentComponent>, private gameService: GameService, private webSocketService: WebSocketService, private storageService: StorageService) {
        this.tournaments = this.gameService.joinableTournaments;
    }

    getUserNames(ids: string[]): string[] {
        const names = [];
        for (const id of ids) {
            const user = this.storageService.getUserFromId(id);
            if (user) {
                names.push(user.username);
            }
        }
        return names;
    }

    createGame(): void {
        const payload: CreateTournamentPayload = {
            userIds: [],
            isPrivate: this.gameType === "Public" || this.gameType === "Protected" ? false : true,
        }
        const event : ClientEvent = "create-tournament";
        //console.log(payload);
        this.webSocketService.send(event, payload);
        this.close();
    }

    close() {
        this.dialogRef.close(); 
    }
}