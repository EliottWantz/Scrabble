import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { CommunicationService } from "@app/services/communication/communication.service";
import { UserService } from "@app/services/user/user.service";

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    theme: BehaviorSubject<string> = new BehaviorSubject("light");
    language: BehaviorSubject<string> = new BehaviorSubject('fr');

    constructor(private commService: CommunicationService, private userService: UserService) {
        this.userService.subjectUser.subscribe(() => {
            this.theme.next(this.userService.subjectUser.value.preferences.theme);
            this.language.next(this.userService.subjectUser.value.preferences.language);
        });
    }

    switchTheme(): void {
        if (this.theme.value === 'dark') {
            this.theme.next("light");
            if (this.userService.isLoggedIn)
                this.commService.updateTheme("light", this.language.value, this.userService.subjectUser.value.id);
        } else {
            this.theme.next("dark");
            if (this.userService.isLoggedIn)
                this.commService.updateTheme("dark", this.language.value, this.userService.subjectUser.value.id);
        }
    }

    switchLanguage(): void {
        if (this.language.value === 'fr') {
            this.language.next("en");
            if (this.userService.isLoggedIn)
                this.commService.updateTheme(this.theme.value, "en", this.userService.subjectUser.value.id);
        } else {
            this.language.next("fr");
            if (this.userService.isLoggedIn)
                this.commService.updateTheme(this.theme.value, "fr", this.userService.subjectUser.value.id);
        }
    }
}