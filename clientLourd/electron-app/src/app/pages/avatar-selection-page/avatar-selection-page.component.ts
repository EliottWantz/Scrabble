import { Component } from "@angular/core";

@Component({
    selector: "app-avatar-selection-page",
    templateUrl: "./avatar-selection-page.component.html",
    styleUrls: ["./avatar-selection-page.component.scss"],
})
export class AvatarSelectionPageComponent {
    isLoginView = true;

    switchView(): void {
        this.isLoginView = !this.isLoginView;
    }
}