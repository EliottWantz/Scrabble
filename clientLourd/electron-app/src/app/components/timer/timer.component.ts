import { Component, OnInit } from "@angular/core";
import { GameService } from "@app/services/game/game.service";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: "app-timer",
    templateUrl: "./timer.component.html",
    styleUrls: ["./timer.component.scss"],
})
export class TimerComponent implements OnInit {
    timer!: BehaviorSubject<number>;
    constructor(private gameService: GameService) {}

    ngOnInit() {
        this.timer = this.gameService.timer;
        this.timer.subscribe();
    }
}