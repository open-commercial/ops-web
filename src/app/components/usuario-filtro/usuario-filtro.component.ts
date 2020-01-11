import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Usuario } from '../../models/usuario';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, switchMap, tap } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { UsuariosService } from '../../services/usuarios.service';
import { Rol } from '../../models/rol';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Producto } from '../../models/producto';
import { UsuarioModalComponent } from '../usuario-modal/usuario-modal.component';


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
  loading = false;
  usuario: Usuario = null;

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

  constructor(private usuariosService: UsuariosService,
              private modalService: NgbModal) { }

  ngOnInit() {}

  private setUsuario(u: Usuario, applyChange = true) {
    this.usuario = u;
    this.value = u ? u.idUsuario : null;
    if (applyChange) {
      this.onTouch();
      this.onChange(this.value);
    }
  }

  select() {
    const modalRef = this.modalService.open(UsuarioModalComponent, {scrollable: true});
    modalRef.componentInstance.roles = this.pRoles;
    modalRef.result.then((u: Usuario) => {
      this.setUsuario(u);
    }, (reason) => {});
  }

  clearValue() {
    this.setUsuario(null);
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

  writeValue(idUsuario: number): void {
    if (!idUsuario) {
      this.setUsuario(null, false);
      return;
    }
    this.loading = true;
    this.usuariosService.getUsuario(idUsuario)
      .pipe(finalize(() => this.loading = false ))
      .subscribe((u: Usuario) => {
        this.setUsuario(u, false);
      })
    ;
  }

  getDisplayValue() {
    if (this.usuario) {
      return this.usuario.username + ' - ' + this.usuario.nombre + this.usuario.apellido;
    }
    return '';
  }

  getLabelForId() {
    return `${this.label.toLowerCase().replace(' ', '_')}`;
  }
/*  select(obj: any) {
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

  loadUsuarios() {
    this.input$.pipe(
      debounceTime(700),
      distinctUntilChanged(),
      tap(() => this.loading = true),
      switchMap(term => this.usuario$ = this.usuariosService.getUsuarios(term, 0, this.pRoles).pipe(
        map((v: Pagination) => v.content),
        catchError(() => of([])), // empty list on error
        tap(() => this.loading = false)
      ))
    ).subscribe();
  }*/
}
