import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Ubicacion} from '../../models/ubicacion';
import {HelperService} from '../../services/helper.service';
import {UbicacionModalComponent} from '../ubicacion-modal-component/ubicacion-modal.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ubicacion-form-field',
  templateUrl: './ubicacion-form-field.component.html',
  styleUrls: ['./ubicacion-form-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UbicacionFormFieldComponent),
      multi: true
    }
  ]
})
export class UbicacionFormFieldComponent implements ControlValueAccessor {
  value: Ubicacion;
  isDisabled = false;

  private pId = 'ubicacion';
  @Input() set id(value: string) { this.pId = value; }
  get id(): string { return this.pId; }

  private pLabel = 'Ubicación';
  @Input() set label(value: string) { this.pLabel = value; }
  get label(): string { return this.pLabel; }

  onChange = (_: any) => { /*This is intentional*/ };
  onTouch = () => { /*This is intentional*/ };

  constructor(private modalService: NgbModal) {}

  private setUbicacion(u: Ubicacion, applyChange = true) {
    this.value = u;
    if (applyChange) {
      this.onTouch();
      this.onChange(this.value);
    }
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

  writeValue(obj: Ubicacion): void {
    this.setUbicacion(obj);
  }

  getDisplayValue() {
    return HelperService.formatUbicacion(this.value);
  }

  clearValue() {
    this.value = null;
  }

  edit() {
    const modalRef = this.modalService.open(UbicacionModalComponent, { size: 'lg' });
    modalRef.componentInstance.ubicacion = this.value;
    modalRef.componentInstance.title = this.label;
    modalRef.result.then((u: Ubicacion) => {
      this.setUbicacion(u);
    }, () => { /*This is intentional*/ });
  }
}
