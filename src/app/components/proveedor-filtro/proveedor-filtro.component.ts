import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { ProveedoresService } from '../../services/proveedores.service';
import { Proveedor } from '../../models/proveedor';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, switchMap, tap } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Producto } from '../../models/producto';
import { ProductoModalComponent } from '../producto-modal/producto-modal.component';
import { ProveedorModalComponent } from '../proveedor-modal/proveedor-modal.component';

@Component({
  selector: 'app-proveedor-filtro',
  templateUrl: './proveedor-filtro.component.html',
  styleUrls: ['./proveedor-filtro.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProveedorFiltroComponent),
      multi: true
    }
  ]
})
export class ProveedorFiltroComponent implements OnInit, ControlValueAccessor {
  loading = false;
  proveedor: Proveedor = null;

  value;
  isDisabled: boolean;
  onChange = (_: any) => { };
  onTouch = () => { };

  constructor(public proveedoresService: ProveedoresService,
              private modalService: NgbModal) { }

  ngOnInit() { }

  setProveedor(p: Proveedor, applyChange = true) {
    this.proveedor = p;
    this.value = p ? p.idProveedor : null;
    if (applyChange) {
      this.onTouch();
      this.onChange(this.value);
    }
  }

  select() {
    const modalRef = this.modalService.open(ProveedorModalComponent, {scrollable: true});
    modalRef.result.then((p: Proveedor) => {
      this.setProveedor(p);
    }, (reason) => {});
  }

  clearValue() {
    this.setProveedor(null);
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

  writeValue(idProveedor: number): void {
    if (!idProveedor) {
      this.setProveedor(null, false);
      return;
    }
    this.loading = true;
    this.proveedoresService.getProveedor(idProveedor)
      .pipe(finalize(() => this.loading = false ))
      .subscribe((p: Proveedor) => {
        this.setProveedor(p, false);
      })
    ;
  }

  getDisplayValue() {
    if (this.proveedor) {
      return this.proveedor.nroProveedor + ' - ' + this.proveedor.razonSocial;
    }
    return '';
  }
}
