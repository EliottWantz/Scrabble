import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AuthentificationService } from "@app/services/authentification/authentification.service";
//import { User } from "@common/user";
import { FormGroup } from "@angular/forms";
import { StorageService } from "@app/services/storage/storage.service";
//import { first } from 'rxjs/operators';

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
  //password: string;

  constructor(
    private authenticationService: AuthentificationService,
    private matDialog: MatDialog
  ) {
    if (this.authenticationService.getIsConnected) {
      this.closeModal();
    }
    this.username = "";
    //this.password = "";
  }

  ngOnInit() {
    if (this.authenticationService.currentUserValue.id != "0") {
      this.closeModal();
    }
    this.username = "";
    //this.password = "";
  }

  onSubmit() {
    this.submitted = true;

    if (this.username == "" /* || this.password == ""*/) {
      return;
    }
    this.authenticationService
      .login(this.username /*, this.password*/)
      .subscribe(
        (user) => {
          if (user) {
            this.authenticationService.isConnected = true;
            this.authenticationService.currentUserSubject.next(user.user);
            StorageService.setUserInfo(user.user);
            this.matDialog.closeAll();

            // this.socketService.connect(user.user.id);

            // this.commService.connect(this.currentUserValue.id).then(() => {
            //     console.log('good');
            // }).catch((error) => {
            //     console.log(error);
            // });
          }
        },
        (error: Error) => {
          this.hasError = true;
          console.log(error);
        }
      );

    // if (!this.authenticationService.getIsConnected) {
    //   this.hasError = true;
    //   return;
    // }
  }

  isConnected(): Boolean {
    return this.authenticationService.getIsConnected;
  }

  switchView(): void {
    this.loginView = !this.loginView;
  }

  closeModal(): void {
    this.hasError = false;
    this.matDialog.closeAll();
  }
}
