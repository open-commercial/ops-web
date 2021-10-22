import { Component, forwardRef, Input } from '@angular/core';
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
export class RangoFechaFiltroComponent implements ControlValueAccessor {
  private pLabel = 'Fecha';

  fromDate: NgbDate;
  toDate: NgbDate;

  value = { desde: null, hasta: null };
  isDisabled: boolean;

  onChange = (_: any) => { return; };
  onTouch = () => { return; };

  @Input()
  set label(label: string) { this.pLabel = label; }
  get label() { return this.pLabel; }

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
    if (!obj) {
      this.onFromDateSelection(null);
      this.onToDateSelection(null);
    } else {
      this.onFromDateSelection(obj.desde, false);
      this.onToDateSelection(obj.hasta, false);
    }
  }

  onFromDateSelection(date, applyChange = true) {
    this.fromDate = date;
    this.value.desde = this.fromDate;
    if (applyChange) {
      this.onTouch();
      this.onChange(this.value);
    }
  }

  onToDateSelection(date, applyChange = true) {
    this.toDate = date;
    this.value.hasta = this.toDate;
    if (applyChange) {
      this.onTouch();
      this.onChange(this.value);
    }
  }

  clearFromDate() {
    this.onFromDateSelection(null);
  }

  clearToDate() {
    this.onToDateSelection(null);
  }
}
