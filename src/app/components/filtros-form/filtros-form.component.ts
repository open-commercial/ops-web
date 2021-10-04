import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-filtros-form',
  templateUrl: './filtros-form.component.html',
  styleUrls: ['./filtros-form.component.scss']
})
export class FiltrosFormComponent {
  private pform: FormGroup;

  @Input()
  set form(value: FormGroup) {
    this.pform = value;
  }
  get form() { return this.pform; }

  @Input() fieldsTemplate: TemplateRef<any>;

  @Output() filterBtnClick = new EventEmitter<void>();
  @Output() resetBtnClick = new EventEmitter<void>();

  filter() {
    this.filterBtnClick.emit();
  }

  reset() {
    this.resetBtnClick.emit();
  }
}
