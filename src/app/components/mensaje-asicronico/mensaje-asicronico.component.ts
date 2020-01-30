import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mensaje-asicronico',
  templateUrl: './mensaje-asicronico.component.html',
  styleUrls: ['./mensaje-asicronico.component.scss']
})
export class MensajeAsicronicoComponent implements OnInit {
  private pAsyncFn: Observable<string>;

  @Input()
  set asyncFn(fn: Observable<string>) { this.pAsyncFn = fn || new Observable<string>(); }
  get asyncFn(): Observable<string> { return this.pAsyncFn; }

  constructor() { }

  ngOnInit() {
  }

}
