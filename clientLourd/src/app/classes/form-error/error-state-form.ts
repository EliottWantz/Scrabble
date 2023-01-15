import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class MessageErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null): boolean {
        return !!(control && control.hasError('maxlength'));
    }
}
