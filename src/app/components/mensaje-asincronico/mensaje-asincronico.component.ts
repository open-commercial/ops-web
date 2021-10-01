import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mensaje-asincronico',
  templateUrl: './mensaje-asincronico.component.html',
  styleUrls: ['./mensaje-asincronico.component.scss']
})
export class MensajeAsincronicoComponent {
  private pAsyncFn: Observable<string>;

  @Input()
  set asyncFn(fn: Observable<string>) { this.pAsyncFn = fn || new Observable<string>(); }
  get asyncFn(): Observable<string> { return this.pAsyncFn; }
}
