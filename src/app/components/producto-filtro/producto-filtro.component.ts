import { Component, EventEmitter, forwardRef, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Producto } from '../../models/producto';
import { ProductosService } from '../../services/productos.service';
import { ProductoModalComponent } from '../producto-modal/producto-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-producto-filtro',
  templateUrl: './producto-filtro.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProductoFiltroComponent),
      multi: true
    }
  ]
})
export class ProductoFiltroComponent implements ControlValueAccessor {
  loading = false;
  private pProducto: Producto = null;
  get producto() { return this.pProducto; }

  @Output() objectChange = new EventEmitter<Producto>();

  value;
  isDisabled = false;
  onChange = (_: any) => { return; };
  onTouch = () => { return; };

  constructor(private productosService: ProductosService,
              private modalService: NgbModal) { }

  private setProducto(p: Producto, applyChange = true) {
    this.pProducto = p;
    this.value = p ? p.idProducto : null;
    if (applyChange) {
      this.onTouch();
      this.onChange(this.value);
      this.objectChange.emit(this.producto);
    }
  }

  select() {
    const modalRef = this.modalService.open(ProductoModalComponent, {scrollable: true});
    modalRef.result.then((p: Producto) => {
      this.setProducto(p);
    }, () => { return; });
  }

  clearValue() {
    this.setProducto(null);
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

  writeValue(idProducto: number): void {
    if (!idProducto) {
      this.setProducto(null, false);
      return;
    }
    this.loading = true;
    this.productosService.getProducto(idProducto)
      .pipe(finalize(() => this.loading = false ))
      .subscribe((p: Producto) => {
        this.setProducto(p, false);
      })
    ;
  }

  getDisplayValue() {
    return this.pProducto ? this.pProducto.descripcion : '';
  }
}
