import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-welcome-button',
    templateUrl: './welcome-button.component.html',
    styleUrls: ['./welcome-button.component.scss'],
})
export class WelcomeButtonComponent {
    @Input() version: string = '';
    @Input() imageSrc: string = '';
    @Input() letterSrc: string = '';
    @Input() message: string = '';
}
