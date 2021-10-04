import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-filtro-ordenamiento',
  templateUrl: './filtro-ordenamiento.component.html',
  styleUrls: ['./filtro-ordenamiento.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FiltroOrdenamientoComponent),
      multi: true
    }
  ]
})
export class FiltroOrdenamientoComponent implements ControlValueAccessor {
  value;
  isDisabled = false;

  private pValues: { val: string, text: string }[] = [];
  @Input()
  set values(values: { val: string, text: string }[]) { this.pValues = values; }
  get values() { return this.pValues; }

  private pLabel = '';

  @Input() set label(value: string) {
    this.pLabel = value;
    this.pLabelId = this.label.toLowerCase().replace(' ', '_');
  }
  get label(): string { return this.pLabel; }

  private pLabelId = '';
  get labelId() { return this.pLabelId; }

  onChange = (_: any) => { return; };
  onTouch = () => { return; };

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
