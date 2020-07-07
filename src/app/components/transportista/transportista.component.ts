import { Component, EventEmitter, forwardRef, OnInit, Output } from '@angular/core';
import { TransportistasService } from '../../services/transportistas.service';
import { Transportista } from '../../models/transportista';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-transportista',
  templateUrl: './transportista.component.html',
  styleUrls: ['./transportista.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TransportistaComponent),
      multi: true
    }
  ]
})
export class TransportistaComponent implements OnInit, ControlValueAccessor {
  transportistas: Transportista[] = [];

  @Output() objectChange = new EventEmitter<Transportista>();

  value;
  isDisabled: boolean;
  onChange = (_: any) => { };
  onTouch = () => { };

  constructor(private transportistasService: TransportistasService) { }

  ngOnInit() {
    this.transportistasService.getTransportistas()
      .subscribe((transportistas: Transportista[]) => {
        this.transportistas = transportistas;
      })
    ;
  }

  select($event) {
    this.value = $event.target.value;
    this.onTouch();
    this.onChange(this.value);
    this.emitObject();
  }

  emitObject() {
    let object: Transportista = null;
    if (this.value) {
      const id = Number(this.value);
      if (!isNaN(id)) {
        const i = this.transportistas.findIndex((t: Transportista) => t.idTransportista === id);
        object = i >= 0 ? this.transportistas[i] : null;
      }
    }
    this.objectChange.emit(object);
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
    setTimeout(() => this.emitObject(), 500);
  }
}
