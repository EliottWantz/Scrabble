import { Component } from "@angular/core";
//import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthenticationService } from "@app/services/authentication/authentication.service";
import { Router } from "@angular/router"

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
    username: string = "";
    password: string = "";
    isLoginFailed = false;
    
    constructor(private authService: AuthenticationService, private router: Router) { }
    
    async onSubmit() {
        if (this.username == "" || this.password == "")
            return;
        const isLoggedIn = await this.authService.login(this.username, this.password);

        if (isLoggedIn) {
            this.router.navigate(['/home']);
        } else {
            this.isLoginFailed = true;
        }
    }
}