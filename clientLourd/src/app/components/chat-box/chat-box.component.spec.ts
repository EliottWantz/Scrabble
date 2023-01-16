/* eslint-disable dot-notation */
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatService } from '@app/services/chat/chat.service';
import { EventBusService } from '@app/services/events/event-bus.service';
import { MockEventBusTestHelper } from '@app/utils/mocks/event-bus-test-helper';
import { ChatMessage } from '@common/chatMessage';
import { BehaviorSubject } from 'rxjs';
import { ChatBoxComponent } from './chat-box.component';

describe('ChatBoxComponent', () => {
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    // let eventBus: EventBusService;
    // let eventBusSpy: jasmine.SpyObj<EventBusService>;
    let eventBusTestHelper: MockEventBusTestHelper;

    beforeEach(async () => {
        chatServiceSpy = jasmine.createSpyObj('ChatService', ['init', 'sendMessage', 'sendCommand', 'showError', 'send'], {
            messages$: new BehaviorSubject<ChatMessage[]>([]),
        });
        // eventBusSpy = jasmine.createSpyObj('EventBusService', ['subscribe', 'on', 'emit']);
        eventBusTestHelper = new MockEventBusTestHelper();
        await TestBed.configureTestingModule({
            declarations: [ChatBoxComponent],
            imports: [ReactiveFormsModule, BrowserAnimationsModule, ScrollingModule, MatIconModule, MatFormFieldModule, MatInputModule],
            providers: [
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: EventBusService, useValue: eventBusTestHelper },
                // { provide: EventBusService, useValue: eventBusSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // eventBus = TestBed.inject(EventBusService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(chatServiceSpy.init).toHaveBeenCalled();
    });

    it('ngOnInit() should initialize messages$, messagesSub and register focusChatBox event listener', (done) => {
        const chatBoxFocusSpy = spyOn(component.chatBoxInput.nativeElement, 'focus');
        component.ngOnInit();
        expect(component.messages$).toBeDefined();
        expect(component.messages$).toEqual(chatServiceSpy.messages$);
        expect(component.messagesSub).toBeDefined();
        eventBusTestHelper.subscribe('focusChatBox', () => {
            expect(component.messagesSub).toBeDefined();
            expect(chatBoxFocusSpy).toHaveBeenCalled();
            done();
        });
        eventBusTestHelper.emit('focusChatBox');
    });

    it('ngOnDestroy() should unsubscribe from messagesSub', () => {
        component.ngOnDestroy();
        expect(component.messagesSub.closed).toBeTruthy();
    });

    it('input getter should return the chatBoxForm input FormControl', () => {
        const formInput = component.chatBoxForm.get('input') as AbstractControl;
        expect(component.input).toBe(formInput);
    });
    it('send() should call chatSrrvice.Send()', fakeAsync(() => {
        const stubInput = '!passer';
        component.input.setValue(stubInput);
        component.send();
        tick();
        expect(chatServiceSpy.send).toHaveBeenCalledWith(stubInput);
    }));
    it('scrollBottom() should scroll to the bottom of the container', () => {
        fixture.autoDetectChanges();
        const container = component.chatBoxMessagesContainer.elementRef.nativeElement as HTMLElement;
        const messagesNum = 20;
        const oldScrollHeight = container.scrollHeight;
        for (let i = 0; i < messagesNum; i++) {
            const p = document.createElement('p');
            p.innerHTML = `${i}`;
            container.appendChild(p);
        }
        component['scrollBottom']();
        expect(container.scrollHeight).toBeGreaterThan(oldScrollHeight);
        expect(Math.round(container.scrollTop)).toEqual(Math.round(container.scrollHeight - container.clientHeight));
    });

    it('splitReserveText() should split the reserve message at each letter', () => {
        const left = ['A: 5', 'C: 10'];
        const right = ['B: 0', 'D: 4'];
        const expectedMap = new Map<string, string[]>();
        expectedMap.set('left', left);
        expectedMap.set('right', right);
        const stubMessage = 'A: 5\nB: 0\nC: 10\nD: 4\n';
        expect(component.splitReserveText(stubMessage)).toEqual(expectedMap);
    });

    it('splitHelpText should split the message at each command', () => {
        const stubMessage = '!placer sert à placer\n!indice sert à recevoir un indice';
        const expectedList = ['!placer sert à placer', '!indice sert à recevoir un indice'];
        expect(component.splitHelpText(stubMessage)).toEqual(expectedList);
    });
});
