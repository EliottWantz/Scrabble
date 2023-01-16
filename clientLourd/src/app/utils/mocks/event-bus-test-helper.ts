/* eslint-disable  */

import { Subscription } from 'rxjs';

/* Mock class should not be tested*/
type CallbackSignature = (params: any) => void;

export class MockEventBusTestHelper {
    subscribe(event: string, callback: CallbackSignature): Subscription {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }

        this.callbacks.get(event)!.push(callback);
        return new Subscription();
    }

    emit(event: string, params?: any) {
        if (!this.callbacks.has(event)) {
            return;
        }

        for (const callback of this.callbacks.get(event)!) {
            callback(params);
        }
    }

    private callbacks = new Map<string, CallbackSignature[]>();
}
