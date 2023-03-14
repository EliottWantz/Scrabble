import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { AuthenticationService } from "@app/services/authentication/authentication.service";
import { Router } from "@angular/router"

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements AfterViewInit {
    username = "";
    password = "";
    isLoginFailed = false;
    @ViewChild("usernameInput")
    private usernameInput!: ElementRef;
    
    constructor(private authService: AuthenticationService, private router: Router) { }

    ngAfterViewInit(): void {
        setTimeout(() => {
          this.usernameInput.nativeElement.focus();
        });
    }
    
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