import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageErrorStateMatcher } from '@app/classes/form-error/error-state-form';
import { ChatService } from '@app/services/chat/chat.service';
import { EventBusService } from '@app/services/events/event-bus.service';
import { ChatMessage } from '@common/chatMessage';
import { BehaviorSubject, Subscription } from 'rxjs';
const MESSAGE_MAX_LENGTH = 512;

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnInit, OnDestroy {
    @ViewChild('chatBoxMessages') chatBoxMessagesContainer: CdkVirtualScrollViewport;
    @ViewChild('chatBoxInput') chatBoxInput: ElementRef<HTMLInputElement>;
    chatBoxForm: FormGroup;
    messageValidator: MessageErrorStateMatcher;
    messages$: BehaviorSubject<ChatMessage[]>;
    messagesSub: Subscription;

    constructor(private chatService: ChatService, private fb: FormBuilder, private eventBus: EventBusService) {
        this.messageValidator = new MessageErrorStateMatcher();
        this.chatBoxForm = this.fb.group({
            input: ['', [Validators.required, Validators.maxLength(MESSAGE_MAX_LENGTH)]],
        });
        this.chatService.init();
    }

    ngOnInit(): void {
        this.messages$ = this.chatService.messages$;
        this.messagesSub = this.messages$.subscribe(() => {
            setTimeout(() => this.scrollBottom());
        });
        this.eventBus.subscribe('focusChatBox', () => {
            this.chatBoxInput.nativeElement.focus();
        });
    }

    ngOnDestroy(): void {
        this.messagesSub.unsubscribe();
    }

    get input(): AbstractControl {
        return this.chatBoxForm.controls.input;
    }

    async send(): Promise<void> {
        await this.chatService.send(this.input.value);
        this.chatBoxForm.reset();
    }

    splitReserveText(message: string): Map<string, string[]> {
        const messageSplit = message.split('\n').filter((element) => element);
        const stringMap = new Map<string, string[]>();
        stringMap.set('left', [messageSplit[0]]);
        stringMap.set('right', [messageSplit[1]]);
        for (let i = 2; i < messageSplit.length; i++) {
            if (i % 2 === 0) {
                (stringMap.get('left') as string[]).push(messageSplit[i]);
            } else {
                (stringMap.get('right') as string[]).push(messageSplit[i]);
            }
        }
        return stringMap;
    }

    splitHelpText(message: string): string[] {
        return message.split('\n').filter((element) => element);
    }

    private scrollBottom(): void {
        this.chatBoxMessagesContainer.elementRef.nativeElement.scrollTop = this.chatBoxMessagesContainer.elementRef.nativeElement.scrollHeight;
    }
}
