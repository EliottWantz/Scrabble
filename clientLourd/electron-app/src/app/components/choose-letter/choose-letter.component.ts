import { Component, Inject } from "@angular/core";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { GameService } from "@app/services/game/game.service";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { Cover, MoveInfo } from "@app/utils/interfaces/game/move";
import { PlayMovePayload } from "@app/utils/interfaces/packet";
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MoveService } from "@app/services/game/move.service";

@Component({
    selector: "app-choose-letter",
    templateUrl: "./choose-letter.component.html",
    styleUrls: ["./choose-letter.component.scss"],
})
export class ChooseLetterComponent {
    letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    constructor(private _bottomSheetRef: MatBottomSheetRef<ChooseLetterComponent>,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: {indexPlacedTile: number},
        private moveService: MoveService
        ) {
    }

    chooseLetter(letter: string): void {
        this.moveService.placedTiles[this.data.indexPlacedTile].letter = letter.charCodeAt(0);
        this._bottomSheetRef.dismiss();
    }
}