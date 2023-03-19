import { Component, OnInit } from "@angular/core";
//import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthenticationService } from "@app/services/authentication/authentication.service";
import { Router } from "@angular/router"
import { CommunicationService } from "@app/services/communication/communication.service";

@Component({
    selector: "app-register",
    templateUrl: "./register.component.html",
    styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
    username = "";
    password = "";
    email = "";
    avatar: {url: string, fileId: string} = {url: "", fileId: ""};
    isRegisterFailed = false;
    defaultAvatars: {url: string, fileId: string}[];
    errorMessage = "";
    
    constructor(private authService: AuthenticationService, private router: Router, private commService: CommunicationService) { 
        this.defaultAvatars = [];
        this.authService.tempUserLogin.username = "";
        this.authService.tempUserLogin.password = "";
        this.authService.tempUserLogin.email = "";
    }
    
    ngOnInit(): void {
        this.commService.getDefaultAvatars().then((res) => {
            this.defaultAvatars = res.avatars;
        });

        this.errorMessage = this.authService.errorMessage;
    }
    
    onSubmit() {
        if (this.username == "" || this.password == "" || this.email =="")
            return;

        this.authService.tempUserLogin.username = this.username;
        this.authService.tempUserLogin.password = this.password;
        this.authService.tempUserLogin.email = this.email;
        this.router.navigate(['/avatar']);
        //const isLoggedIn = await this.authService.register(this.username, this.password, this.email, this.avatar.url, this.avatar.fileId);

        /*if (isLoggedIn) {
            this.router.navigate(['/home']);
        } else {
            this.isRegisterFailed = true;
        }*/
    }
}