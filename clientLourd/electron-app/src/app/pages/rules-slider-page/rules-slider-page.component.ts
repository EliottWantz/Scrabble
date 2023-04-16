import { Component } from "@angular/core";
import { ThemeService } from "@app/services/theme/theme.service";


@Component({
  selector: "app-rules-slider-page",
  templateUrl: "./rules-slider-page.component.html",
  styleUrls: ["./rules-slider-page.component.scss"],
})
export class RulesSliderPageComponent {
  frenchImages = [
    "assets/BasicFR.png",
    "assets/ClickFR.png",
    "assets/PlayFR.png",
    "assets/MultiplierFR.png",
    "assets/ExchangeFR.png",
    "assets/HintFR.png"
  ];
  englishImages = [
    "assets/BasicEN.png",
    "assets/ClickEN.png",
    "assets/PlayEN.png",
    "assets/MultiplierEN.png",
    "assets/ExchangeEN.png",
    "assets/HintEN.png"
  ];
  titles = ["basic", "click", "move", "multiplier", "exchange", "hint"];
  constructor(private themeService: ThemeService) {}

  isFrench(): boolean {
    return this.themeService.language.value === "fr";
  }
}