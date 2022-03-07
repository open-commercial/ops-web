import {Component, OnInit} from '@angular/core';
import {ListadoDirective} from '../../../../directives/listado.directive';
import {ActivatedRoute, Router} from '@angular/router';
import {SucursalesService} from '../../../../services/sucursales.service';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {Observable} from 'rxjs';
import {Pagination} from '../../../../models/pagination';
import {FormBuilder} from '@angular/forms';
import {TransportistasService} from '../../../../services/transportistas.service';
import {BusquedaTransportistaCriteria} from '../../../../models/criterias/busqueda-transportista-criteria';
import {Provincia} from '../../../../models/provincia';
import {Localidad} from '../../../../models/localidad';
import {UbicacionesService} from '../../../../services/ubicaciones.service';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';
import {Rol} from '../../../../models/rol';
import {AuthService} from '../../../../services/auth.service';
import {Transportista} from '../../../../models/transportista';
import {HelperService} from '../../../../services/helper.service';

@Component({
  selector: 'app-transportistas',
  templateUrl: './transportistas.component.html',
})
export class TransportistasComponent extends ListadoDirective implements OnInit {
  allowedRolesToCrear: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToCrear = false;
  allowedRolesToEdit: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToEdit = false;
  allowedRolesToDelete: Rol[] = [ Rol.ADMINISTRADOR ];
  hasRoleToDelete = false;

  provincias: Provincia[] = [];
  localidades: Localidad[] = [];

  helper = HelperService;
  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              private fb: FormBuilder,
              private transportistasService: TransportistasService,
              private authService: AuthService,
              private ubicacionesService: UbicacionesService) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.hasRoleToCrear = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCrear);
    this.hasRoleToEdit = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToEdit);
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);

    this.loadingOverlayService.activate();
    this.ubicacionesService.getProvincias()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: provincias => this.provincias = provincias,
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }

  getTerminosFromQueryParams(ps) {
    const terminos: BusquedaTransportistaCriteria = {
      pagina: this.page,
    };

    const config = {
      idProvincia: { checkNaN: true },
      idLocalidad: { checkNaN: true },
    };

    return HelperService.paramsToTerminos<BusquedaTransportistaCriteria>(ps, config , terminos);
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      nombre: '',
      idProvincia: null,
      idLocalidad: null,
    });

    this.filterForm.get('idProvincia').valueChanges
      .subscribe(value => {
        if (!value) {
          this.localidades.length = 0;
          return;
        }

        this.loadingOverlayService.activate();
        this.ubicacionesService.getLocalidades(value)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe({
            next: localidades => this.localidades = localidades,
            error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
          })
        ;
      })
    ;
  }

  resetFilterForm() {
    this.filterForm.reset({
      nombre: '',
      idProvincia: null,
      idLocalidad: null,
    });
  }

  getAppliedFilters() {
    const values = this.filterForm.value;
    this.appliedFilters = [];

    if (values.nombre) {
      this.appliedFilters.push({ label: 'Nombre', value: values.nombre });
    }

    setTimeout(() => {
      if (values.idProvincia) {
        this.appliedFilters.push({label: 'Provincia', value: this.getNombreProvincia(values.idProvincia)});
      }

      if (values.idLocalidad) {
        this.appliedFilters.push({label: 'Localidad', value: this.getNombreLocalidad(values.idLocalidad)});
      }
    }, 500);
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret: {[k: string]: any} = {};

    if (values.nombre) { ret.nombre = values.nombre; }
    if (values.idProvincia) { ret.idProvincia = values.idProvincia; }
    if (values.idLocalidad) { ret.idLocalidad = values.idLocalidad; }

    return ret;
  }

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.transportistasService.buscar(terminos as BusquedaTransportistaCriteria);
  }

  getNombreProvincia(idProvincia: string): string {
    if (!idProvincia) { return ''; }
    const aux = this.provincias.filter(p => p.idProvincia === Number(idProvincia));
    return aux.length ? aux[0].nombre : '';
  }

  getNombreLocalidad(idLocalidad: string): string {
    if (!idLocalidad) { return ''; }
    const aux = this.localidades.filter(p => p.idLocalidad === Number(idLocalidad));
    return aux.length ? aux[0].nombre : '';
  }

  crearTransportista() {
    if (!this.hasRoleToCrear) {
      this.mensajeService.msg('No posee permiso para dar de alta un transportistas', MensajeModalType.ERROR);
      return;
    }

    this.router.navigate(['/transportistas/nuevo']);
  }

  editarTransportista(t: Transportista) {
    if (!this.hasRoleToEdit) {
      this.mensajeService.msg('No posee permiso para editar datos del transportistas', MensajeModalType.ERROR);
      return;
    }

    this.router.navigate(['/transportistas/editar', t.idTransportista]);
  }

  eliminarTransportista(t: Transportista) {
    if (!this.hasRoleToDelete) {
      this.mensajeService.msg('No posee permiso para eliminar transportistas', MensajeModalType.ERROR);
      return;
    }

    const msg = `¿Está seguro que desea eliminar el transportista?`;
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.transportistasService.eliminarTransportista(t.idTransportista)
          .subscribe({
            next: () => location.reload(),
            error: err => {
              this.loadingOverlayService.deactivate();
              this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            }
          })
        ;
      }
    });
  }
}
