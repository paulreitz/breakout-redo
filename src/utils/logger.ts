import {Subject} from 'rxjs';
import { throttleTime } from 'rxjs';

class Logger {
    private _message$: Subject<string> = new Subject<string>();
    private _throttleMS = 500;

    constructor() {
        this._message$
            .pipe(throttleTime(this._throttleMS))
            .subscribe((message) => {
                console.log(message);
            });
    }

    public log(message: string): void {
        this._message$.next(message);
    }
}

export const logger = new Logger();