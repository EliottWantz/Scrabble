import { Component } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { AuthentificationService } from "@app/services/authentification/authentification.service";
//import { User } from "@common/user";
import { FormGroup } from "@angular/forms";
import { first } from 'rxjs/operators';

export const SMALLEST = -1;

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  returnUrl: string;
  loginView: Boolean = false;
  hasError: Boolean = false;
  username: string;
  password: string;

  constructor(
      private authenticationService: AuthentificationService,
      private matDialog: MatDialog) 
    {
        if (this.authenticationService.getIsConnected) {
            this.closeModal();
        }
        this.username = "";
        this.password = "";
  }

  ngOnInit() {
    if (this.authenticationService.getIsConnected) {
      this.closeModal();
    }
    this.username = "";
    this.password = "";
  }

  onSubmit() {
    this.submitted = true;

    if (this.username == "" || this.password == "") {
      return;
    }

    this.authenticationService.login(this.username, this.password).pipe(first()).subscribe(() => {
      this.closeModal()
    }, 
    (error: Error) => {
      this.hasError = true;
      console.log(error);
    });
  }

  switchView(): void {
    this.loginView = !this.loginView;
  }

  closeModal(): void {
    this.matDialog.closeAll();
  }
}
