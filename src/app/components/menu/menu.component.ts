import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @Output() menuOptionClick = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  optionClick() {
    this.menuOptionClick.emit();
  }
}
