import { Component } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { AuthentificationService } from "@app/services/authentification/authentification.service";

export const SMALLEST = -1;

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  hasAccount: Boolean;
  username: string;
  password: string;
  email: string;
  show: boolean;
  constructor(private matDialog: MatDialog, private authService: AuthentificationService) {
    this.hasAccount = true;
    this.username = "";
    this.password = "";
    this.email = "";
    this.show = false;
  }
  
  createAccount() {
    console.log("user name is " + this.username);
    this.clear();
  }

  connect() {
    const succeeded: Boolean = this.authService.login(this.username, this.password);
    if (succeeded) {
      console.log(this.authService.user);
    }
    console.log("user name is " + this.username);
    this.clear();
  }

  clear() {
    this.username = "";
    this.password = "";
    this.show = true;
  }

  switchView(): void {
    this.hasAccount = !this.hasAccount;
  }

  closeModal(): void {
    this.matDialog.closeAll();
  }
}
