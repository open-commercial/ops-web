import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { ProveedoresService } from '../../services/proveedores.service';
import { Proveedor } from '../../models/proveedor';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';

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

  proveedores$: Observable<Proveedor[]>;
  loading = false;
  input$  = new Subject<string>();

  value;
  isDisabled: boolean;
  onChange = (_: any) => { };
  onTouch = () => { };

  constructor(public proveedoresService: ProveedoresService) { }

  ngOnInit() {
    this.loadProveedores();
  }

  select(obj: any) {
    this.value = obj;
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

  loadProveedores() {
    this.input$.pipe(
      debounceTime(700),
      distinctUntilChanged(),
      tap(() => this.loading = true),
      switchMap(term => this.proveedores$ = this.proveedoresService.getProveedores(term).pipe(
        map((v: Pagination) => v.content),
        catchError(() => of([])), // empty list on error
        tap(() => this.loading = false)
      ))
    ).subscribe();
  }
}
