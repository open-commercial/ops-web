import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

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
  hoveredDate: NgbDate;

  fromDate: NgbDate;
  toDate: NgbDate;

  value = { desde: null, hasta: null };
  isDisabled: boolean;
  onChange = (_: any) => { };
  onTouch = () => { };

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
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }

    if (!this.value) { this.value = { desde: null, hasta: null}; }

    if (this.fromDate && this.toDate) {
      this.value.desde = this.fromDate;
      this.value.hasta = this.toDate;
    } else {
      this.value.desde = null;
      this.value.hasta = null;
    }

    this.onTouch();
    this.onChange(this.value);
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);
  }

  getDateStr(date: NgbDate|null) {
    if (!date) { return null; }
    return [date.day, date.month, date.year].join('/');
  }

  clearDates() {
    this.fromDate = null;
    this.toDate = null;
    this.onChange(null);
  }
}
