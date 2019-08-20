import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { Usuario } from '../../models/usuario';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { UsuariosService } from '../../services/usuarios.service';
import { Rol } from '../../models/rol';


@Component({
  selector: 'app-usuario-filtro',
  templateUrl: './usuario-filtro.component.html',
  styleUrls: ['./usuario-filtro.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UsuarioFiltroComponent),
      multi: true
    }
  ]
})
export class UsuarioFiltroComponent implements OnInit, ControlValueAccessor {

  usuario$: Observable<Usuario[]>;
  loading = false;
  input$  = new Subject<string>();

  // El prefijo p en pRoles es para establecer una convención para variables privadas
  // ya que ahora el prefijo _ (guión bajo) lo subraya en rojo.
  private pRoles: Array<Rol>;
  private pLabel = 'Usuario';

  value;
  isDisabled: boolean;
  onChange = (_: any) => { };
  onTouch = () => { };

  @Input()
  set roles(roles: Array<Rol>) {
    this.pRoles = roles;
  }
  get roles(): Array<Rol> { return this.pRoles; }

  @Input()
  set label(label: string) { this.pLabel = label; }
  get label() { return this.pLabel; }

  constructor(private usuariosService: UsuariosService) { }

  ngOnInit() {
    this.loadUsuarios();
  }

  select(obj: any) {
    this.value = obj ? obj.id_Usuario : '';
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

  loadUsuarios() {
    this.input$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.loading = true),
      switchMap(term => this.usuario$ = this.usuariosService.getUsuarios(term, 0, this.pRoles).pipe(
        map((v: Pagination) => v.content),
        catchError(() => of([])), // empty list on error
        tap(() => this.loading = false)
      ))
    ).subscribe();
  }
}
