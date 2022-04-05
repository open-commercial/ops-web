import { AuthService } from './../../../../services/auth.service';
import {Component, OnInit, ViewChild} from '@angular/core';
import {ListadoDirective} from '../../../../directives/listado.directive';
import {ActivatedRoute, Router} from '@angular/router';
import {SucursalesService} from '../../../../services/sucursales.service';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {Observable} from 'rxjs';
import {Pagination} from '../../../../models/pagination';
import {FormBuilder} from '@angular/forms';
import {UsuariosService} from '../../../../services/usuarios.service';
import {BusquedaUsuarioCriteria} from '../../../../models/criterias/busqueda-usuario-criteria';
import {FiltroOrdenamientoComponent} from '../../../../components/filtro-ordenamiento/filtro-ordenamiento.component';
import {HelperService} from '../../../../services/helper.service';
import {BusquedaCuentaCorrienteClienteCriteria} from '../../../../models/criterias/busqueda-cuenta-corriente-cliente-criteria';
import {Rol} from '../../../../models/rol';
import {Usuario} from '../../../../models/usuario';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent extends ListadoDirective implements OnInit {

  ordenArray = [
    { val: 'nombre', text: 'Nombre' },
    { val: 'apellido', text: 'Apellido' },
    { val: 'username', text: 'Usuario' },
    { val: 'habilitado', text: 'Habilitado' },
  ];

  sentidoArray = [
    { val: 'ASC', text: 'Ascendente' },
    { val: 'DESC', text: 'Descendente' },
  ];

  ordenarPorAplicado = '';
  sentidoAplicado = '';

  helper = HelperService;

  @ViewChild('ordernarPorU') ordenarPorUElement: FiltroOrdenamientoComponent;
  @ViewChild('sentidoU') sentidoUElement: FiltroOrdenamientoComponent;

  roles = [
    { value: Rol.ADMINISTRADOR, text: Rol.ADMINISTRADOR.toString() },
    { value: Rol.ENCARGADO, text: Rol.ENCARGADO.toString() },
    { value: Rol.VENDEDOR, text: Rol.VENDEDOR.toString() },
    { value: Rol.VIAJANTE, text: Rol.VIAJANTE.toString() },
    { value: Rol.COMPRADOR, text: Rol.COMPRADOR.toString() },
  ];

  allowedRolesToManageUsuarios: Rol[] = [Rol.ADMINISTRADOR];

  hasRoleToManageUsuarios = false;

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              private fb: FormBuilder,
              private usuariosService: UsuariosService,
              private authService: AuthService) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.hasRoleToManageUsuarios = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToManageUsuarios);
    if (!this.allowedRolesToManageUsuarios) {
      this.mensajeService.msg('Ud. no posee permisos para administrar usuarios.', MensajeModalType.ERROR);
      this.router.navigate(['/']);
    }
  }

  getTerminosFromQueryParams(ps) {
    let terminos: BusquedaUsuarioCriteria = {
      pagina: this.page,
    };

    const { orden, sentido } = this.getDefaultOrdenYSentido();
    const config = {
      ordenarPor: { defaultValue: orden },
      sentido: { defaultValue: sentido },
    };

    terminos = HelperService.paramsToTerminos<BusquedaCuentaCorrienteClienteCriteria>(ps, config , terminos);

    if (ps.nombre) {
      terminos.username = ps.nombre;
      terminos.nombre = ps.nombre;
      terminos.apellido = ps.nombre;
      terminos.email = ps.nombre;
    }

    if (ps.rol) {
      terminos.roles = [ps.rol];
    }

    return terminos;
  }

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.usuariosService.buscar(terminos as BusquedaUsuarioCriteria);
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      nombre: '',
      rol: null,
    });
  }

  resetFilterForm() {
    this.filterForm.reset({
      nombre: '',
      rol: null,
    });
  }

  getAppliedFilters() {
    const values = this.filterForm.value;
    this.appliedFilters = [];

    if (values.nombre) {
      this.appliedFilters.push({ label: 'Usuario, Nombre, Apellido, Email', value: values.nombre });
    }

    if (values.rol) {
      this.appliedFilters.push({ label: 'Rol', value: values.rol });
    }

    setTimeout(() => {
      this.ordenarPorAplicado = this.ordenarPorUElement ? this.ordenarPorUElement.getTexto() : '';
      this.sentidoAplicado = this.sentidoUElement ? this.sentidoUElement.getTexto() : '';
    }, 500);
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret: {[k: string]: any} = {};

    if (values.nombre) { ret.nombre = values.nombre; }
    if (values.rol) { ret.rol = values.rol; }

    return ret;
  }

  nuevoUsuario() {
    if (!this.allowedRolesToManageUsuarios) {
      this.mensajeService.msg('Ud. no posee permisos para crear usuarios.', MensajeModalType.ERROR);
      return;
    }

    this.router.navigate(['/usuarios/nuevo']);
  }

  editarUsuario(u: Usuario) {
    if (!this.allowedRolesToManageUsuarios) {
      this.mensajeService.msg('Ud. no posee permisos para editar usuarios.', MensajeModalType.ERROR);
      return;
    }
    this.router.navigate(['/usuarios/editar', u.idUsuario]);
  }

  eliminarUsuario(u: Usuario) {
    if (!this.allowedRolesToManageUsuarios) {
      this.mensajeService.msg('Ud. no posee permisos para eliminar usuarios.', MensajeModalType.ERROR);
      return;
    }

    const msg = 'Esta seguro que desea eliminar el usuario seleccionado?';
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then(result => {
      if (result) {
        this.loadingOverlayService.activate();
        this.usuariosService.eliminarUsuario(u.idUsuario)
          .subscribe({
            next: () => location.reload(),
            error: err => {
              this.loadingOverlayService.deactivate();
              this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            },
          })
        ;
      }
    });
  }
}
