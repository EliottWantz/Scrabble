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
    isLoggedIn = false;
    isLoginFailed = false;
    
    constructor(private authService: AuthenticationService, private router: Router) { }
    
    ngOnInit(): void {
        if (this.authService.isLoggedIn) {
            this.isLoggedIn = true;
        }
    }
    
    async onSubmit() {
        if (this.username == "" || this.password == "")
            return;
        await this.authService.login(this.username, this.password);

        if (this.authService.isLoggedIn) {
            this.router.navigate(['/home']);
        } else {
            this.isLoginFailed = true;
        }
    }
}