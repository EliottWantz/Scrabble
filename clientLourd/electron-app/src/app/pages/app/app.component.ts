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
  isDarkMode: BehaviorSubject<boolean>;
  language: BehaviorSubject<string>;

  constructor(private renderer: Renderer2, private themeService: ThemeService, private translate: TranslateService) {
    this.language = this.themeService.language;
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
    this.themeService.language.subscribe(() => {
      this.translate.use(this.language.value);
    });
    this.isDarkMode = this.themeService.isDark;
    this.isDarkMode.subscribe(() => {
      this.renderPageBodyColor();
    })
  }

  @HostBinding('class')
  public get themeMode() {
    return this.isDarkMode.value ? 'dark-theme' : 'light-theme';
  }

  private renderPageBodyColor() {
    this.renderer.removeClass(document.body, 'dark');
    this.renderer.removeClass(document.body, 'light');
    this.renderer.addClass(document.body, this.isDarkMode.value ? 'dark' : 'light');
  }
}
