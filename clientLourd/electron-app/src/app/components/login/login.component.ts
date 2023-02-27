import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "@app/services/authentication/authentication.service";
import { Router } from "@angular/router"
import { StorageService } from "@app/services/storage/storage.service";

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
    errorMessage = '';
    
    constructor(private authService: AuthService, private storageService: StorageService, private router: Router) { }
    
    ngOnInit(): void {
        if (this.storageService.isLoggedIn()) {
            this.isLoggedIn = true;
        }
    }
    
    async onSubmit() {
        await this.authService.login(this.username, this.password);

        if (this.authService.isLoggedIn) {
            this.router.navigate(['home']);
        }
    }
}