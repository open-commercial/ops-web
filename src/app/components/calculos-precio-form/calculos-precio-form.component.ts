import { Component, forwardRef, Input } from '@angular/core';
import {
  ControlValueAccessor, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup,
  NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators
} from '@angular/forms';
import { CalculosPrecio, CalculosPrecioValues } from '../../models/calculos-precio';
import { formatNumber } from '@angular/common';
import Big from 'big.js';

Big.DP = 15;

@Component({
  selector: 'app-calculos-precio-form',
  templateUrl: './calculos-precio-form.component.html',
  styleUrls: ['./calculos-precio-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalculosPrecioFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CalculosPrecioFormComponent),
      multi: true
    }
  ]
})
export class CalculosPrecioFormComponent implements ControlValueAccessor {
  calculosForm: UntypedFormGroup;
  calculosPrecio = new CalculosPrecio();
  ivas = [0, 10.5, 21];

  private pSubmitted = true;
  @Input() set submitted(value: boolean) { this.pSubmitted = value; }
  get submitted(): boolean { return this.pSubmitted; }

  onChange: any = () => { return; };
  onTouched: any = () => { return; };

  constructor(private fb: UntypedFormBuilder) {
    this.createForm();
  }

  get value(): CalculosPrecioValues {
    return this.calculosPrecio.getValues();
  }

  set value(value: CalculosPrecioValues) {
    this.refreshPreciosEnFormulario();
    this.onChange(value);
    this.onTouched();
  }

  createForm() {
    this.calculosForm = this.fb.group({
      precioCosto: [0, [Validators.required, Validators.min(0)]],
      gananciaPorcentaje: [0, [Validators.required, Validators.min(0)]],
      precioVentaPublico: [0, [Validators.required, Validators.min(0)]],
      ivaPorcentaje: [0, Validators.required],
      precioLista: [0, [Validators.required, Validators.min(0)]],
      porcentajeBonificacionPrecio: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      precioBonificado: [0, [Validators.required, Validators.min(0)]],
      oferta: false,
      porcentajeBonificacionOferta: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0), Validators.max(100)]],
      precioOferta: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
    });
  }

  get f() { return this.calculosForm.controls; }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  writeValue(value: CalculosPrecioValues) {
    if (value) {
      this.calculosPrecio = CalculosPrecio.getInstance(value);
    } else {
      this.calculosPrecio = new CalculosPrecio();
    }
    this.doChangeOferta(this.calculosPrecio.oferta);
    this.refreshPreciosEnFormulario();
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.calculosForm.disable();
    } else {
      this.calculosForm.enable();
      if (!this.calculosForm.get('oferta').value) {
        this.calculosForm.get('porcentajeBonificacionOferta').disable();
        this.calculosForm.get('precioOferta').disable();
      }
    }
    this.value = this.calculosPrecio.getValues();
  }

  // communicate the inner form validation to the parent form
  validate(_: UntypedFormControl) {
    return this.calculosForm.valid ? null : { calculosPrecio: { valid: false } };
  }

  refreshPreciosEnFormulario() {
    const fieldsNames = [
      'precioCosto', 'gananciaPorcentaje', 'precioVentaPublico', 'ivaPorcentaje',  'precioLista',
      'porcentajeBonificacionPrecio', 'precioBonificado', 'porcentajeBonificacionOferta', 'precioOferta',
    ];
    fieldsNames.forEach(fn => this.calculosForm.get(fn).setValue(this.formatBigForDisplay(this.calculosPrecio[fn])));
    this.calculosForm.get('oferta').setValue(this.calculosPrecio.oferta);
  }

  formatBigForDisplay(n: Big) {
    return formatNumber(parseFloat(n.toFixed(2)), 'en-US', '1.0-2').replace(',', '');
  }

  calculosFieldChange(fieldName: string, $event) {
    const v = $event.target.value;
    const value = parseFloat(v);
    this.calculosPrecio[fieldName] = isNaN(value) ? new Big(0) : new Big(v);
    this.value = this.calculosPrecio.getValues();
  }

  ofertaChange($event) {
    this.calculosPrecio.oferta = $event.target.checked;
    this.doChangeOferta(this.calculosPrecio.oferta);
    this.value = this.calculosPrecio.getValues();
  }

  doChangeOferta(checked: boolean) {
    if (checked) {
      this.calculosForm.get('porcentajeBonificacionOferta').enable();
      this.calculosForm.get('precioOferta').enable();
    } else {
      this.calculosForm.get('porcentajeBonificacionOferta').disable();
      this.calculosForm.get('precioOferta').disable();
    }
  }
}
