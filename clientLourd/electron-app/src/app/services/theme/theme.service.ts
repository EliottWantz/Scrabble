import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    isDark: BehaviorSubject<boolean> = new BehaviorSubject(false);
    language: BehaviorSubject<string> = new BehaviorSubject('fr');

    switchTheme(): void {
        if (this.isDark.value) {
            this.isDark.next(false);
        } else {
            this.isDark.next(true);
        }
    }

    switchLanguage(): void {
        if (this.language.value === 'fr') {
            this.language.next("en");
        } else {
            this.language.next("fr");
        }
    }
}