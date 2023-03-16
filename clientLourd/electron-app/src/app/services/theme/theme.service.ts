import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    isDark: BehaviorSubject<boolean> = new BehaviorSubject(false);

    switchValue(): void {
        if (this.isDark.value) {
            this.isDark.next(false);
        } else {
            this.isDark.next(true);
        }
    }
}