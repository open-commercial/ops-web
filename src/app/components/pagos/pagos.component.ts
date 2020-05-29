import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormaDePago } from '../../models/forma-de-pago';
import { FormasDePagoService } from '../../services/formas-de-pago.service';
import { combineLatest } from 'rxjs';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { MensajeService } from '../../services/mensaje.service';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PagosComponent),
      multi: true
    }
  ]
})
export class PagosComponent implements OnInit, ControlValueAccessor {
  formasDePago: FormaDePago[] = [];
  formaDePagoPredeterminada: FormaDePago;

  private pTotalAPagar = 0;
  @Input() set totalAPagar(value: number) { this.pTotalAPagar = value; }
  get totalAPagar() { return this.pTotalAPagar; }

  value = [];
  isDisabled: boolean;
  onChange = (_: any) => { };
  onTouch = () => { };

  constructor(private formasDePagoService: FormasDePagoService,
              private mensajeService: MensajeService) { }

  ngOnInit() {
    combineLatest([
      this.formasDePagoService.getFormaDePagoPredeterminada(),
      this.formasDePagoService.getFormasDePago()
    ]).subscribe((data: [FormaDePago, FormaDePago[]]) => {
      this.formaDePagoPredeterminada = data[0];
      this.formasDePago = data[1];
    });
  }

  agregarPago() {
    const m = this.value.length ? 0.0 : this.totalAPagar;
    this.value.push({
      idFormaDePago: this.formaDePagoPredeterminada ? this.formaDePagoPredeterminada.idFormaDePago : null,
      monto: m,
    });
    this.onTouch();
    this.onChange(this.value);
  }

  quitarPago(i) {
    const msg = '¿Desea quitar este pago?';
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) { this.value.splice(i, 1); }
    });
    this.onTouch();
    this.onChange(this.value);
  }

  onFormaPagoChange(i, $event) {
    const v = Number($event.target.value);
    this.value[i].idFormaDePago = isNaN(v) ? null : v;
    this.onTouch();
    this.onChange(this.value);
  }

  onMontoChange(i, $event) {
    const v = Number($event.target.value);
    this.value[i].monto = isNaN(v) ? 0.0 : v;
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
    this.value = Array.isArray(obj) ? obj : [];
  }
}
