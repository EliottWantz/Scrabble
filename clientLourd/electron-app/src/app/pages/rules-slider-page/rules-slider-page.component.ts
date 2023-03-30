import { Component } from "@angular/core";


@Component({
  selector: "app-rules-slider-page",
  templateUrl: "./rules-slider-page.component.html",
  styleUrls: ["./rules-slider-page.component.scss"],
})
export class RulesSliderPageComponent {
  page = 0;
  nextPage(): void {
    this.page++;
    this.page = this.mod(this.page,3);
    console.log(this.page);
  }
  previousPage(): void {
    this.page--;
    this.page = this.mod(this.page,3);
    console.log(this.page);
  }
  mod(n:number, m:number):number {
    return ((n % m) + m) % m;
  }
}
