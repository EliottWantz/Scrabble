import { Component, ElementRef } from "@angular/core";
//import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthenticationService } from "@app/services/authentication/authentication.service";
import { Router } from "@angular/router"

@Component({
    selector: "app-register",
    templateUrl: "./register.component.html",
    styleUrls: ["./register.component.scss"],
})
export class RegisterComponent {
    username: string = "";
    password: string = "";
    email: string = "";
    avatar: string = "";
    isRegisterFailed = false;
    
    constructor(private authService: AuthenticationService, private router: Router) { }
    
    onSubmit() {
        if (this.username == "" || this.password == "" || this.email =="" || this.avatar == "")
            return;
        this.authService.register(this.username, this.password, this.email, this.avatar);

        if (this.authService.isLoggedIn) {
            console.log("allo2");
            this.router.navigate(['/home']);
        }
    }

    selectAvatar(num: number): void {
        console.log("allo");
        let src;
        for(let i = 0; i < document.getElementsByClassName("avatar").length; i++) {
            if (i != num) {
                document.getElementsByClassName("avatar")[i].setAttribute("style", "");
            } else {
                src = document.getElementsByClassName("avatar")[i].getAttribute("src");
                document.getElementsByClassName("avatar")[i].setAttribute("style", "background: -webkit-linear-gradient(left top, crimson 0%, #f90 100%);");
            }
        }
        if (src)
            this.avatar = src;
        console.log(this.avatar);
    }
}