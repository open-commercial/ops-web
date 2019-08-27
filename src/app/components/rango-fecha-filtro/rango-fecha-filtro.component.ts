import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgbDate, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-rango-fecha-filtro',
  templateUrl: './rango-fecha-filtro.component.html',
  styleUrls: ['./rango-fecha-filtro.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangoFechaFiltroComponent),
      multi: true
    }
  ]
})
export class RangoFechaFiltroComponent implements OnInit, ControlValueAccessor {
  private pLabel = 'Fecha';

  fromDate: NgbDate;
  toDate: NgbDate;

  value = { desde: null, hasta: null };
  isDisabled: boolean;

  onChange = (_: any) => { };
  onTouch = () => { };

  @Input()
  set label(label: string) { this.pLabel = label; }
  get label() { return this.pLabel; }

  constructor() {}

  ngOnInit() {}

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.value = obj;
    if (!obj) {
      this.onFromDateSelection(null);
      this.onToDateSelection(null);
    }
  }

  onFromDateSelection(date) {
    this.fromDate = date;
    this.value = this.fromDate || this.toDate ? { desde: this.fromDate, hasta: this.toDate } : null;
    this.onTouch();
    this.onChange(this.value);
  }

  onToDateSelection(date) {
    this.toDate = date;
    this.value = this.fromDate || this.toDate ? { desde: this.fromDate, hasta: this.toDate } : null;
    this.onTouch();
    this.onChange(this.value);
  }

  clearFromDate() {
    this.onFromDateSelection(null);
  }

  clearToDate() {
    this.onToDateSelection(null);
  }
}
