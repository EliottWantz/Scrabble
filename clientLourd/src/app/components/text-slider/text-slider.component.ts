import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { GridService } from '@app/services/grid/grid.service';

@Component({
    selector: 'app-text-slider',
    templateUrl: './text-slider.component.html',
    styleUrls: ['./text-slider.component.scss'],
})
export class TextSliderComponent {
    constructor(private gridService: GridService) {}

    changeTextValue(event: MatSliderChange): void {
        if (!event.value) return;
        this.gridService.fontTileSize = event.value;
        this.gridService.renderRect();
    }
}
