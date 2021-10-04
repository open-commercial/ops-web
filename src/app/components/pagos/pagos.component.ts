import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormaDePago } from '../../models/forma-de-pago';
import { FormasDePagoService } from '../../services/formas-de-pago.service';
import { combineLatest } from 'rxjs';
import { formatNumber } from '@angular/common';

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

  private pSaldoCCC = 0;
  @Input() set saldoCCC(value: number) { this.pSaldoCCC = value; }
  get saldoCCC() { return this.pSaldoCCC; }

  value = [];
  isDisabled: boolean;
  onChange = (_: any) => { return; };
  onTouch = () => { return; };

  constructor(private formasDePagoService: FormasDePagoService) { }

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
    let m = 0;
    if (!this.value.length) {
      if (this.pSaldoCCC <= 0) {
        m = -1 * this.saldoCCC + this.pTotalAPagar;
      } else {
        m = this.pSaldoCCC >= this.pTotalAPagar ? 0 : (this.pTotalAPagar - this.pSaldoCCC);
      }
    }
    this.value.push({
      idFormaDePago: this.formaDePagoPredeterminada ? this.formaDePagoPredeterminada.idFormaDePago : null,
      monto: Number(formatNumber(m, 'en', '1.0-2').replace(',', '')),
    });

    this.onTouch();
    this.onChange(this.value);
  }

  quitarPago(i) {
    this.value.splice(i, 1);
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
