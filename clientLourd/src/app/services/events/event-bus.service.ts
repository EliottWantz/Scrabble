import { Injectable } from '@angular/core';
import { Observable, pipe, Subject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface EventBusEvent {
    event: EventKeys;
    value?: EventValue<EventKeys>;
}

interface Events {
    focusChatBox: () => void;
    keyPressed: string;
    mouseWheel: number;
    resetAllSelectedLetters: () => void;
}
type EventKeys = keyof Events;
type EventValue<Event extends EventKeys> = Events[Event];

@Injectable({
    providedIn: 'root',
})
export class EventBusService {
    eventBus$: Subject<EventBusEvent> = new Subject();

    emit<Event extends EventKeys>(event: Event, value?: EventValue<Event>): void {
        this.eventBus$.next({ event, value });
    }

    on<Event extends EventKeys>(event: Event): Observable<EventValue<EventKeys> | undefined> {
        return this.eventBus$.pipe(this.getEventValue(event));
    }

    subscribe<Event extends EventKeys>(event: Event, listener: (valueEmitted?: EventValue<EventKeys>) => void): Subscription {
        return this.on(event).subscribe(listener);
    }

    getEventValue<Event extends EventKeys>(event: Event) {
        return pipe(
            filter((emittedEvent: EventBusEvent) => emittedEvent.event === event),
            map((emittedEvent: EventBusEvent) => emittedEvent.value),
        );
    }
}
