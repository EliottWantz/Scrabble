import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatSidenav } from "@angular/material/sidenav";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { ThemeService } from "@app/services/theme/theme.service";
//import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: "app-sidebar",
    templateUrl: "./sidebar.component.html",
    styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent {
    @Input() sidenavHandle!: MatSidenav;
  public title = 'Fleet Management';
  private darkThemeIcon = 'nightlight_round';
  private lightThemeIcon = 'wb_sunny';
  public lightDarkToggleIcon = this.darkThemeIcon;

  constructor(private themeService: ThemeService) { }

  public doToggleLightDark() {
    this.themeService.switchValue();
  }
}