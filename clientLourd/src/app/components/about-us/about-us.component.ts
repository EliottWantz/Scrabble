import { Component } from '@angular/core';
import { aboutUs } from '@common/aboutUs';
import team from 'src/assets/aboutUs.json';
@Component({
    selector: 'app-about-us',
    templateUrl: './about-us.component.html',
    styleUrls: ['./about-us.component.scss'],
})
export class AboutUsComponent {
    team: aboutUs[][];
    constructor() {
        this.team = team;
    }
}
