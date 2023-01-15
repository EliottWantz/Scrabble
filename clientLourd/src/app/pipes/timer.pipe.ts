import { Pipe, PipeTransform } from '@angular/core';
import { TIMER_PIPE_CONST } from '@app/utils/constants/parameters-constants';
@Pipe({
    name: 'timer',
})
export class TimerPipe implements PipeTransform {
    minutes: number;
    seconds: number;
    timeMMSS: string;
    transform(value: number): string {
        this.seconds = (value / TIMER_PIPE_CONST.secondToMillisecond) % TIMER_PIPE_CONST.secondToMinute;
        this.minutes = (value / TIMER_PIPE_CONST.secondToMillisecond - this.seconds) / TIMER_PIPE_CONST.secondToMinute;

        this.timeMMSS =
            this.seconds < TIMER_PIPE_CONST.secondMinNotation
                ? this.minutes.toString() + ':0' + this.seconds.toFixed(0)
                : this.minutes.toFixed(0) + ':' + this.seconds.toString();
        return this.timeMMSS;
    }
}
