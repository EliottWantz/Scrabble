import { TestBed } from '@angular/core/testing';
import { of, Subscription } from 'rxjs';
import { EventBusEvent, EventBusService } from './event-bus.service';

describe('EventBusService', () => {
    let service: EventBusService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(EventBusService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('emit() should add the EventBusEvent to the eventBus$', (done) => {
        service.eventBus$.subscribe((event) => {
            expect(event).toEqual({ event: 'focusChatBox', value: undefined });
            done();
        });
        service.emit('focusChatBox');
    });

    it('on() should return the emitted value of the matching event', () => {
        service.eventBus$.next({ event: 'keyPressed', value: 'a' });
        const getEventValueSpy = spyOn(service, 'getEventValue').and.callThrough();
        const result = service.on('keyPressed');
        expect(getEventValueSpy).toHaveBeenCalledWith('keyPressed');
        result.subscribe((value) => {
            expect(value).toEqual('a');
        });
    });

    it('subscribe() should call on() and subscribe to the returned observable with the listener() in parameters, returning the subscription', () => {
        const listener = jasmine.createSpy('listener');
        const onSpy = spyOn(service, 'on').and.returnValue(of('test'));
        const sub = service.subscribe('focusChatBox', listener);
        expect(onSpy).toHaveBeenCalled();
        expect(listener).toHaveBeenCalled();
        expect(sub).toEqual(jasmine.any(Subscription));
    });

    it('getEventValue() should return the value of the event', () => {
        const results: string[] = [];
        of<EventBusEvent>({ event: 'keyPressed', value: 'a' })
            .pipe(service.getEventValue('keyPressed'))
            .subscribe((event) => results.push(event as string));
        expect(results).toEqual(['a']);
    });
});
