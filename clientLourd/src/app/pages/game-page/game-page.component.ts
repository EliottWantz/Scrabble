import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { EventBusService } from '@app/services/events/event-bus.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements AfterViewInit {
    constructor(private eventBus: EventBusService, private cdRef: ChangeDetectorRef) {}

    ngAfterViewInit(): void {
        setTimeout(() => this.eventBus.emit('focusChatBox'));
        this.cdRef.detectChanges();
    }
}
