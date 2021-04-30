import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Usuario } from '../../models/usuario';
import { finalize } from 'rxjs/operators';
import { UsuariosService } from '../../services/usuarios.service';
import { Rol } from '../../models/rol';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UsuarioModalComponent } from '../usuario-modal/usuario-modal.component';
import {NewOrUpdateUsuarioModalComponent} from '../new-or-update-usuario-modal/new-or-update-usuario-modal.component';
import {UFProfile} from '../usuario-form/usuario-form.component';


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
export class UsuarioFiltroComponent implements ControlValueAccessor {
  loading = false;
  usuario: Usuario = null;

  private pRoles: Array<Rol>;
  private pLabel = 'Usuario';
  private pShowNewButton = false;
  private pProfile = UFProfile.USUARIO;

  icono = 'user';

  value;
  isDisabled: boolean;
  onChange = (_: any) => { /*This is intentional*/ };
  onTouch = () => { /*This is intentional*/ };

  @Input()
  set roles(roles: Array<Rol>) {
    this.pRoles = roles;
    if (this.pRoles.filter(e => e === Rol.VIAJANTE).length) {
      this.icono = 'suitcase';
    }
  }
  get roles(): Array<Rol> { return this.pRoles; }

  @Input()
  set label(label: string) { this.pLabel = label; }
  get label() { return this.pLabel; }

  @Input()
  set showNewButton(value: boolean) { this.pShowNewButton = value; }
  get showNewButton(): boolean { return this.pShowNewButton; }

  @Input() set profile(value: UFProfile) { this.pProfile = value; }
  get profile(): UFProfile { return this.pProfile; }

  constructor(private usuariosService: UsuariosService,
              private modalService: NgbModal) { }

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
    }, () => { /*This is intentional*/ });
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
    return this.usuario ? this.usuario.nombre + ' ' + this.usuario.apellido : '';
  }

  getLabelForId() {
    return `${this.label.toLowerCase().replace(' ', '_')}`;
  }

  new() {
    const nuevoUsuario: Usuario = {
      idUsuario: null,
      username: '',
      password: '',
      email: '',
      nombre: '',
      apellido: '',
      habilitado: true,
      roles: this.pRoles,
    };

    const modalRef = this.modalService.open(NewOrUpdateUsuarioModalComponent);
    modalRef.componentInstance.usuario = nuevoUsuario;
    modalRef.componentInstance.ufProfile = this.profile;
    modalRef.result.then((u: Usuario) => {
      this.setUsuario(u);
    }, () => { /*This is intentional*/ });
  }
}
