import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-ordenar-por-filtro',
  templateUrl: './ordenar-por-filtro.component.html',
  styleUrls: ['./ordenar-por-filtro.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OrdenarPorFiltroComponent),
      multi: true
    }
  ]
})
export class OrdenarPorFiltroComponent implements OnInit, ControlValueAccessor {
  value;
  isDisabled = false;

  private pValues: { val: string, text: string }[] = [];
  @Input()
  set values(values: { val: string, text: string }[]) { this.pValues = values; }
  get values() { return this.pValues; }

  onChange = (_: any) => { };
  onTouch = () => { };
  constructor() { }

  ngOnInit() {
  }

  select($event) {
    this.value = $event.target.value;
    this.onTouch();
    this.onChange(this.value);
  }

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

  getTexto() {
    const aux = this.values.filter(e => e.val === this.value);
    return aux.length ? aux[0].text : '';
  }
}
