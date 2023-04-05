import { Component, Inject } from "@angular/core";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { GameService } from "@app/services/game/game.service";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { Cover, MoveInfo } from "@app/utils/interfaces/game/move";
import { PlayMovePayload } from "@app/utils/interfaces/packet";
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
    selector: "app-advice",
    templateUrl: "./advice.component.html",
    styleUrls: ["./advice.component.scss"],
})
export class AdviceComponent {
    moves: MoveInfo[] = [];
    constructor(private gameService: GameService, private webSocketService: WebSocketService, private _bottomSheetRef: MatBottomSheetRef<AdviceComponent>,
        private userService: UserService, @Inject(MAT_BOTTOM_SHEET_DATA) public data: {moves: MoveInfo[]}) {
        /*this.gameService.scrabbleGame.subscribe((scrabbleGame) => {
            if (scrabbleGame && scrabbleGame.turn != this.userService.currentUserValue.id)
                this._bottomSheetRef.dismiss();
        });*/
    }

    playMove(move: MoveInfo): void {
        if (this.gameService.scrabbleGame.value !== undefined) {
            const payload: PlayMovePayload = {
                gameId: this.gameService.scrabbleGame.value.id,
                moveInfo: move
            };
            this.webSocketService.send("playMove", payload);
        }
        this._bottomSheetRef.dismiss();
    }

    

    getCoversText(cover: Cover | undefined): string {
        let val = "";
        if (cover !== undefined) {
            const tempArray = [];
            for (const key in cover) {
                tempArray.push(key);
                //tempArray.set(key, cover[key as keyof Cover]);
            }
            console.log(tempArray);
            tempArray.sort((a, b) => {
                const aVal = a.split("/");
                const bVal = b.split("/");
                if (parseInt(aVal[0]) + parseInt(aVal[1]) < parseInt(bVal[0]) + parseInt(bVal[1])) {
                    return -1
                } else if (parseInt(aVal[0]) + parseInt(aVal[1]) > parseInt(bVal[0]) + parseInt(bVal[1])) {
                    return 1;
                } else {
                    return 0;
                }
            });

            for (const elem of tempArray) {
                val += `${elem}: ${cover[elem as keyof Cover]}; `;
            }
        }
        return val;
    }
}