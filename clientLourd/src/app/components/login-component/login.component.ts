import { Component } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';

export const SMALLEST = -1;

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
    constructor(private matDialog: MatDialog) {

    }
  username: string = "";
  password: string = "";
  show: boolean = false;
  submit() {
    console.log("user name is " + this.username);
    this.clear();
  }
  clear() {
    this.username = "";
    this.password = "";
    this.show = true;
  }

  closeModal(): void {
    this.matDialog.closeAll();
}
}
