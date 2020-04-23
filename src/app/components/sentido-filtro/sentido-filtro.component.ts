import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-sentido-filtro',
  templateUrl: './sentido-filtro.component.html',
  styleUrls: ['./sentido-filtro.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SentidoFiltroComponent),
      multi: true
    }
  ]
})
export class SentidoFiltroComponent implements OnInit, ControlValueAccessor {
  value;
  isDisabled = false;

  values = [
    { val: 'DESC', text: 'Descendente' },
    { val: 'ASC',  text: 'Ascendente' },
  ];

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
