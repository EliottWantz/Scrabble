import { Component } from "@angular/core";

@Component({
    selector: "app-direction",
    templateUrl: "./direction.component.html",
    styleUrls: ["./direction.component.scss"],
})
export class DirectionComponent {
    horizontal = true;
    x = 0;
    y = 0;
    initialX = 0;
    initialY = 0;

    clicked(): void {
        this.horizontal = !this.horizontal;
    }
}