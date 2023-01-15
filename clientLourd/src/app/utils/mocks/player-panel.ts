import { Directive, Input } from '@angular/core';
import { Player } from '@common/player';
import { Observable } from 'rxjs';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'app-player-panel',
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class PlayerPanelMock {
    @Input() player$: Observable<Player>;
}
