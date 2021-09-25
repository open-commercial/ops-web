import {Component, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';

@Component({
  selector: 'app-selectable-list',
  templateUrl: './selectable-list.component.html',
  styleUrls: ['./selectable-list.component.scss']
})
export class SelectableListComponent implements OnInit {
  @Input() itemTemplate: TemplateRef<any>;

  private pItems: any[] = [];
  @Input() set items(value: any[]) {
    this.pItems = value;
  }
  get items(): any[] { return this.pItems; }

  selectedItem: null;

  @Output() selectedItemChange = new EventEmitter<any>();
  @Output() selectedWithEnter = new EventEmitter<any>();
  @Output() lastElementKeyDown = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  focusInEvent(item) {
    this.selectedItem = item;
    this.selectedItemChange.emit(this.selectedItem);
  }

  keyDownEvent($event) {
    const key = $event.key || $event.code;
    const element = $event.target;

    switch (key) {
      case 'ArrowUp':
        this.focusPrevSibling(element);
        break;
      case 'ArrowDown':
        this.focusNextSibling(element);
        break;
      case 'Enter':
        if (this.selectedItem) {
          this.selectedWithEnter.emit(this.selectedItem);
        }
        break;
      default:
      // code block
    }
  }

  focusNextSibling(element) {
    const nextSibling = element.nextElementSibling;
    if (!nextSibling) {
      // nextSibling = element.parentNode ? element.parentNode.firstElementChild : null;
      this.lastElementKeyDown.emit();
      return;
    }
    if (nextSibling) {
      nextSibling.focus();
    }
  }

  focusPrevSibling(element) {
    let prevSibling = element.previousElementSibling;
    if (!prevSibling) {
      prevSibling = element.parentNode ? element.parentNode.lastElementChild : null;
    }
    if (prevSibling) {
      prevSibling.focus();
    }
  }

  clearSelectedItem() {
    this.selectedItem = null;
    this.selectedItemChange.emit(this.selectedItem);
  }
}
