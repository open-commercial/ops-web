import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Producto } from '../../models/producto';
import { ProductosService } from '../../services/productos.service';
import { ProductoModalComponent } from '../producto-modal/producto-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-producto-filtro',
  templateUrl: './producto-filtro.component.html',
  styleUrls: ['./producto-filtro.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProductoFiltroComponent),
      multi: true
    }
  ]
})
export class ProductoFiltroComponent implements OnInit, ControlValueAccessor {
  loading = false;
  producto: Producto = null;

  value;
  isDisabled = false;
  onChange = (_: any) => { };
  onTouch = () => { };

  constructor(private productosService: ProductosService,
              private modalService: NgbModal) { }

  ngOnInit() {}

  select() {
    const modalRef = this.modalService.open(ProductoModalComponent, {scrollable: true});
    modalRef.result.then((p: Producto) => {
      this.producto = p;
      this.value = p.idProducto;
      this.onTouch();
      this.onChange(this.value);
    }, (reason) => {});
  }

  clearValue() {
    this.producto = null;
    this.value = null;
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
      this.value = null;
      return;
    }
    this.getProducto(idProducto);
  }

  getProducto(idProducto: number) {
    this.loading = true;
    this.productosService.getProducto(idProducto)
      .pipe(finalize(() => this.loading = false ))
      .subscribe((p: Producto) => {
        this.producto = p;
        this.value = p.idProducto;
      })
    ;
  }

  getDisplayValue() {
    if (this.producto) {
      return this.producto.codigo + ' - ' + this.producto.descripcion;
    }
    return '';
  }

  /*loadProductos() {
    this.input$.pipe(
      debounceTime(700),
      distinctUntilChanged(),
      tap(() => this.loading = true),
      switchMap(term => this.productos$ = this.productosService.getProductos(term).pipe(
        map((v: Pagination) => v.content),
        catchError(() => of([])), // empty list on error
        tap(() => this.loading = false)
      ))
    ).subscribe();
  }*/
}
