import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { Observable, of, Subject } from 'rxjs';
import { Producto } from '../../models/producto';
import { ProductosService } from '../../services/productos.service';

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

  productos$: Observable<Producto[]>;
  loading = false;
  input$  = new Subject<string>();

  value;
  isDisabled: boolean;
  onChange = (_: any) => { };
  onTouch = () => { };

  constructor(private productosService: ProductosService) { }

  ngOnInit() {
    this.loadProductos();
  }

  select(obj: any) {
    this.value = obj ? obj.idProducto : '';
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

  loadProductos() {
    this.input$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.loading = true),
      switchMap(term => this.productos$ = this.productosService.getProductos(term).pipe(
        map((v: Pagination) => v.content),
        catchError(() => of([])), // empty list on error
        tap(() => this.loading = false)
      ))
    ).subscribe();
  }
}
