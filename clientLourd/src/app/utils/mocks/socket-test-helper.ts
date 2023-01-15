/* eslint-disable  */
/* Mock class should not be tested*/
type CallbackSignature = (params: any, params2: any) => {};

export class MockSocketTestHelper {
    on(event: string, callback: CallbackSignature): void {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }

        this.callbacks.get(event)!.push(callback);
    }

    off(event: string): void {
        return;
    }

    emit(event: string, ...params: any): void {
        return;
    }

    disconnect(): void {
        return;
    }

    peerSideEmit(event: string, params?: any, params2?: any) {
        if (!this.callbacks.has(event)) {
            return;
        }

        for (const callback of this.callbacks.get(event)!) {
            callback(params, params2);
        }
    }

    private callbacks = new Map<string, CallbackSignature[]>();
}
