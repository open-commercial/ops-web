import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Cliente } from '../../models/cliente';
import { Observable, of, Subject } from 'rxjs';
import { ClientesService } from '../../services/clientes.service';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';

@Component({
  selector: 'app-cliente-filtro',
  templateUrl: './cliente-filtro.component.html',
  styleUrls: ['./cliente-filtro.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ClienteFiltroComponent),
      multi: true
    }
  ]
})
export class ClienteFiltroComponent implements OnInit, ControlValueAccessor {

  clientes$: Observable<Cliente[]>;
  loading = false;
  input$  = new Subject<string>();

  value;
  isDisabled: boolean;
  onChange = (_: any) => { };
  onTouch = () => { };

  constructor(public clientesService: ClientesService) { }

  ngOnInit() {
    this.loadClientes();
  }

  select(obj: any) {
    this.value = obj ? obj.id_Cliente : '';
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

  loadClientes() {
    this.input$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.loading = true),
      switchMap(term => this.clientes$ = this.clientesService.getClientes(term).pipe(
        map((v: Pagination) => v.content),
        catchError(() => of([])), // empty list on error
        tap(() => this.loading = false)
      ))
    ).subscribe();
  }
}
