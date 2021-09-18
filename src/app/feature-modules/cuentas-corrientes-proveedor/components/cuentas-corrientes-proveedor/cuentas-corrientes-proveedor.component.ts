import {Component, OnInit, ViewChild} from '@angular/core';
import {ListadoBaseComponent} from '../../../../components/listado-base.component';
import {ActivatedRoute, Router} from '@angular/router';
import {SucursalesService} from '../../../../services/sucursales.service';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {Observable} from 'rxjs';
import {Pagination} from '../../../../models/pagination';
import {FormBuilder} from '@angular/forms';
import {Provincia} from '../../../../models/provincia';
import {Localidad} from '../../../../models/localidad';
import {BusquedaCuentaCorrienteProveedorCriteria} from '../../../../models/criterias/busqueda-cuenta-corriente-proveedor-criteria';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';
import {UbicacionesService} from '../../../../services/ubicaciones.service';
import {FiltroOrdenamientoComponent} from '../../../../components/filtro-ordenamiento/filtro-ordenamiento.component';
import {CuentasCorrientesService} from '../../../../services/cuentas-corrientes.service';
import {Proveedor} from '../../../../models/proveedor';
import {HelperService} from '../../../../services/helper.service';
import {Rol} from '../../../../models/rol';
import {AuthService} from '../../../../services/auth.service';
import {ProveedoresService} from '../../../../services/proveedores.service';

@Component({
  selector: 'app-cuentas-corrientes-proveedor',
  templateUrl: './cuentas-corrientes-proveedor.component.html',
  styleUrls: ['./cuentas-corrientes-proveedor.component.scss']
})
export class CuentasCorrientesProveedorComponent extends ListadoBaseComponent implements OnInit {
  provincias: Provincia[] = [];
  localidades: Localidad[] = [];

  helper = HelperService;

  ordenarPorOptionsCCP = [
    { val: 'proveedor.razonSocial', text: 'Razón Social' },
    { val: 'saldo', text: 'Saldo C/C' },
    { val: 'fechaUltimoMovimiento', text: 'Último Movimiento C/C' },
  ];

  sentidoOptionsCCP = [
    { val: 'ASC', text: 'Ascendente' },
    { val: 'DESC', text: 'Descendente' },
  ];

  ordenarPorAplicado = '';
  sentidoAplicado = '';
  @ViewChild('ordernarPorCCP') ordenarPorCCPElement: FiltroOrdenamientoComponent;
  @ViewChild('sentidoCCP') sentidoCCPElement: FiltroOrdenamientoComponent;

  allowedRolesToSee: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToSee = false;

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              private fb: FormBuilder,
              private ubicacionesService: UbicacionesService,
              private cuentasCorrientesService: CuentasCorrientesService,
              private proveedoresService: ProveedoresService,
              private authService: AuthService) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.hasRoleToSee = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToSee);
    if (!this.hasRoleToSee) {
      this.mensajeService.msg('No tiene permiso para ver el listado de proveedores.');
      this.router.navigate(['/']);
    }

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
    const terminos: BusquedaCuentaCorrienteProveedorCriteria = {
      pagina: this.page,
    };

    if (ps.nroONom) {
      this.filterForm.get('nroONom').setValue(ps.nroONom);
      terminos.nroProveedor = ps.nroONom;
      terminos.razonSocial = ps.nroONom;
    }

    if (ps.idProvincia) {
      this.filterForm.get('idProvincia').setValue(ps.idProvincia);
      terminos.idProvincia = ps.idProvincia;
    }

    if (ps.idLocalidad) {
      this.filterForm.get('idLocalidad').setValue(ps.idLocalidad);
      terminos.idLocalidad = ps.idLocalidad;
    }

    let ordenarPorVal = this.ordenarPorOptionsCCP.length ? this.ordenarPorOptionsCCP[0].val : '';
    if (ps.ordenarPor) { ordenarPorVal = ps.ordenarPor; }
    this.filterForm.get('ordenarPor').setValue(ordenarPorVal);
    terminos.ordenarPor = ordenarPorVal;

    const sentidoVal = ps.sentido ? ps.sentido : 'ASC';
    this.filterForm.get('sentido').setValue(sentidoVal);
    terminos.sentido = sentidoVal;

    return terminos;
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      nroONom: '',
      idProvincia: null,
      idLocalidad: null,
      ordenarPor: '',
      sentido: '',
    });
  }

  resetFilterForm() {
    this.filterForm.reset({
      nroONom: '',
      idProvincia: null,
      idLocalidad: null,
      ordenarPor: '',
      sentido: '',
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

  getAppliedFilters() {
    const values = this.filterForm.value;
    this.appliedFilters = [];

    if (values.nroONom) {
      this.appliedFilters.push({ label: 'Nº de Proveedor/Nombre', value: values.nroONom });
    }

    setTimeout(() => {
      if (values.idProvincia) {
        this.appliedFilters.push({ label: 'Provincia', value: this.getNombreProvincia(values.idProvincia) });
      }

      if (values.idLocalidad) {
        this.appliedFilters.push({ label: 'Localidad', value: this.getNombreLocalidad(values.idLocalidad) });
      }

      this.ordenarPorAplicado = this.ordenarPorCCPElement ? this.ordenarPorCCPElement.getTexto() : '';
      this.sentidoAplicado = this.sentidoCCPElement ? this.sentidoCCPElement.getTexto() : '';
    }, 500);
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret: {[k: string]: any} = {};

    if (values.nroONom) { ret.nroONom = values.nroONom; }
    if (values.idProvincia) { ret.idProvincia = values.idProvincia; }
    if (values.idLocalidad) { ret.idLocalidad = values.idLocalidad; }
    if (values.ordenarPor) { ret.ordenarPor = values.ordenarPor; }
    if (values.sentido) { ret.sentido = values.sentido; }

    return ret;
  }

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.cuentasCorrientesService.buscarCuentasCorrientesProveedores(terminos as BusquedaCuentaCorrienteProveedorCriteria);
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

  irACtaCte(p: Proveedor) {
    this.router.navigate(['proveedores/cuenta-corriente', p.idProveedor]);
  }

  editarProveedor(p: Proveedor) {
    this.router.navigate(['/proveedores/editar', p.idProveedor]);
  }

  eliminarProveedor(p: Proveedor) {
    const msg = `¿Está seguro que desea eliminar el proveedor: "${p.razonSocial}"?`;

    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.proveedoresService.eliminarProveedor(p.idProveedor)
          // no se hace this.loadingOverlayService.deactivate() porque necesita que se recargue el reload
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
