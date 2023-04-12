import { Component, OnInit } from "@angular/core";
//import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthenticationService } from "@app/services/authentication/authentication.service";
import { Router } from "@angular/router"
import { CommunicationService } from "@app/services/communication/communication.service";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: "app-register",
    templateUrl: "./register.component.html",
    styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
    //username = "";
    //password = "";
    //email = "";
    avatar: {url: string, fileId: string} = {url: "", fileId: ""};
    isRegisterFailed = false;
    defaultAvatars: {url: string, fileId: string}[];
    errorMessage = "";
    userEmails = new FormGroup({
        primaryEmail: new FormControl('', [Validators.required, Validators.email]),
        username: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
    });
    
    constructor(private authService: AuthenticationService, private router: Router, private commService: CommunicationService,  private formBuilder: FormBuilder) { 
        this.defaultAvatars = [];
    }
    
    ngOnInit(): void {
        this.commService.getDefaultAvatars().then((res) => {
            this.defaultAvatars = res.avatars;
        });

        this.errorMessage = this.authService.errorMessage;
    }
    
    onSubmit() {
        console.log(this.userEmails.valid);
        console.log(this.userEmails.value.primaryEmail);
        console.log(this.userEmails.value.username);
        console.log(this.userEmails.value.password);
        if (!this.userEmails.valid || !this.userEmails.value.primaryEmail || !this.userEmails.value.username || !this.userEmails.value.password)
            return;

        const formData = new FormData();
        formData.append("username", this.userEmails.value.username);
        formData.append("password", this.userEmails.value.password);
        formData.append("email", this.userEmails.value.primaryEmail);
        this.authService.tempUserLogin.next(formData);
        this.router.navigate(['/avatar']);
        //const isLoggedIn = await this.authService.register(this.username, this.password, this.email, this.avatar.url, this.avatar.fileId);

        /*if (isLoggedIn) {
            this.router.navigate(['/home']);
        } else {
            this.isRegisterFailed = true;
        }*/
    }
}