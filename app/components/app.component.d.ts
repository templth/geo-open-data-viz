import { MessagesService } from './app.service';
import { Observable } from 'rxjs/Rx';
export declare class AppComponent {
    private service;
    message: string;
    messages: Observable;
    constructor(service: MessagesService);
    onChange(val: any): void;
}
