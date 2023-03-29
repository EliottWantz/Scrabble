import { Component, HostBinding, HostListener, Renderer2 } from '@angular/core';
import { ThemeService } from '@app/services/theme/theme.service';
import { BehaviorSubject } from 'rxjs';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'electron-app';
  theme: BehaviorSubject<string>;
  language: BehaviorSubject<string>;

  constructor(private renderer: Renderer2, private themeService: ThemeService, private translate: TranslateService) {
    this.language = this.themeService.language;
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
    this.themeService.language.subscribe(() => {
      this.translate.use(this.language.value);
    });
    this.theme = this.themeService.theme;
    this.theme.subscribe(() => {
      this.renderPageBodyColor();
    })
  }

  @HostBinding('class')
  public get themeMode() {
    return this.theme.value === "dark" ? 'dark-theme' : 'light-theme';
  }

  private renderPageBodyColor() {
    this.renderer.removeClass(document.body, 'dark');
    this.renderer.removeClass(document.body, 'light');
    this.renderer.addClass(document.body, this.theme.value === "dark" ? 'dark' : 'light');
  }
}
