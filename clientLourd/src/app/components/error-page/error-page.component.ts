import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-error-page',
    templateUrl: './error-page.component.html',
    styleUrls: ['./error-page.component.scss'],
})
export class ErrorPageComponent {
    constructor(public matDialog: MatDialog) {}

    closeModal(): void {
        this.matDialog.closeAll();
    }
}
