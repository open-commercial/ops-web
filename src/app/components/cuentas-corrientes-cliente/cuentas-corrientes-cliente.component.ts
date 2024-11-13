import { Component, OnInit, ViewChild } from '@angular/core';
import { ListadoDirective } from '../../directives/listado.directive';
import { ActivatedRoute, Router } from '@angular/router';
import { SucursalesService } from '../../services/sucursales.service';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { MensajeService } from '../../services/mensaje.service';
import { Observable } from 'rxjs';
import { Pagination } from '../../models/pagination';
import { UntypedFormBuilder } from '@angular/forms';
import { BusquedaCuentaCorrienteClienteCriteria } from '../../models/criterias/busqueda-cuenta-corriente-cliente-criteria';
import { CuentasCorrientesService } from '../../services/cuentas-corrientes.service';
import { FiltroOrdenamientoComponent } from '../filtro-ordenamiento/filtro-ordenamiento.component';
import { finalize, map } from 'rxjs/operators';
import { Usuario } from '../../models/usuario';
import { UsuariosService } from '../../services/usuarios.service';
import { Rol } from '../../models/rol';
import { Provincia } from '../../models/provincia';
import { Localidad } from '../../models/localidad';
import { UbicacionesService } from '../../services/ubicaciones.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { Cliente } from '../../models/cliente';
import { ClientesService } from '../../services/clientes.service';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OPOption, OptionPickerModalComponent } from '../option-picker-modal/option-picker-modal.component';
import { saveAs } from 'file-saver';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'app-cuentas-corrientes-cliente',
  templateUrl: './cuentas-corrientes-cliente.component.html',
  styleUrls: ['./cuentas-corrientes-cliente.component.scss']
})
export class CuentasCorrientesClienteComponent extends ListadoDirective implements OnInit {
  provincias: Provincia[] = [];
  localidades: Localidad[] = [];

  ordenArray = [
    { val: 'fechaUltimoMovimiento', text: 'Fecha último Movimiento' },
    { val: 'cliente.nombreFiscal', text: 'R. Social o Nombre' },
    { val: 'cliente.fechaAlta', text: 'Fecha Alta' },
    { val: 'cliente.nombreFantasia', text: 'Nombre Fantasía' },
    { val: 'saldo', text: 'Saldo C/C' },
  ];

  sentidoArray = [
    { val: 'DESC', text: 'Descendente' },
    { val: 'ASC', text: 'Ascendente' },
  ];

  rol = Rol;

  allowedRolesToDelete: Rol[] = [ Rol.ADMINISTRADOR ];
  allowedRolesToSetPredeterminado: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToDelete = false;
  hasRoleToSetPredeterminado = false;

  ordenarPorAplicado = '';
  sentidoAplicado = '';
  @ViewChild('ordernarPorCCC') ordenarPorCCCElement: FiltroOrdenamientoComponent;
  @ViewChild('sentidoCCC') sentidoCCCElement: FiltroOrdenamientoComponent;

  helper = HelperService;

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              private readonly fb: UntypedFormBuilder,
              private readonly ccService: CuentasCorrientesService,
              private readonly usuariosService: UsuariosService,
              private readonly ubicacionesService: UbicacionesService,
              private readonly clientesService: ClientesService,
              private readonly authService: AuthService,
              private readonly modalService: NgbModal) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
    this.hasRoleToSetPredeterminado = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToSetPredeterminado);

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
    let terminos: BusquedaCuentaCorrienteClienteCriteria = {
      pagina: this.page
    };

    const { orden, sentido } = this.getDefaultOrdenYSentido();
    const config = {
      idViajante: { checkNaN: true },
      idProvincia: { checkNaN: true },
      idLocalidad: { checkNaN: true },
      ordenarPor: { defaultValue: orden },
      sentido: { defaultValue: sentido },
    };

    terminos = HelperService.paramsToTerminos<BusquedaCuentaCorrienteClienteCriteria>(ps, config , terminos);

    if (ps.nroONom) {
      terminos.nroDeCliente = ps.nroONom;
      terminos.nombreFantasia = ps.nroONom;
      terminos.nombreFiscal = ps.nroONom;
      terminos.idFiscal = ps.nroONom;
    }

    return terminos;
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      nroONom: '',
      idViajante: null,
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
            error: err => {
              this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            },
          })
        ;
      })
    ;
  }

  resetFilterForm() {
    this.filterForm.reset({
      nroONom: '',
      idViajante: null,
      ordenarPor: '',
      sentido: '',
    });
  }

  getAppliedFilters() {
    const values = this.filterForm.value;
    this.appliedFilters = [];

    if (values.nroONom) {
      this.appliedFilters.push({ label: 'Nº de Cliente/Nombre', value: values.nroONom });
    }

    if (values.idViajante) {
      this.appliedFilters.push({ label: 'Viajante', value: values.idRubro, asyncFn: this.getUsuarioInfoAsync(values.idViajante) });
    }

    setTimeout(() => {
      if (values.idProvincia) {
        this.appliedFilters.push({ label: 'Provincia', value: this.getNombreProvincia(values.idProvincia) });
      }

      if (values.idLocalidad) {
        this.appliedFilters.push({ label: 'Localidad', value: this.getNombreLocalidad(values.idLocalidad) });
      }

      this.ordenarPorAplicado = this.ordenarPorCCCElement ? this.ordenarPorCCCElement.getTexto() : '';
      this.sentidoAplicado = this.sentidoCCCElement ? this.sentidoCCCElement.getTexto() : '';
    }, 500);
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret: {[k: string]: any} = {};

    if (values.nroONom) { ret.nroONom = values.nroONom; }
    if (values.idViajante) { ret.idViajante = values.idViajante; }
    if (values.idProvincia) { ret.idProvincia = values.idProvincia; }
    if (values.idLocalidad) { ret.idLocalidad = values.idLocalidad; }
    if (values.ordenarPor) { ret.ordenarPor = values.ordenarPor; }
    if (values.sentido) { ret.sentido = values.sentido; }

    return ret;
  }

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.ccService.buscarCuentasCorrientesCliente(terminos as BusquedaCuentaCorrienteClienteCriteria);
  }

  getUsuarioInfoAsync(id: number): Observable<string> {
    return this.usuariosService.getUsuario(id).pipe(map((u: Usuario) => u.nombre + ' ' + u.apellido));
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

  generateReporte() {
    const options: OPOption[] = [{ value: 'xlsx', text: 'Excel'}, { value: 'pdf', text: 'Pdf' }];
    const modalRef = this.modalService.open(OptionPickerModalComponent);
    modalRef.componentInstance.options = options;
    modalRef.componentInstance.title = 'Descargar Reporte';
    modalRef.componentInstance.label = 'Seleccione un formato:';
    modalRef.result.then(formato => {
      const qParams = this.getFormValues();
      const terminos = this.getTerminosFromQueryParams(qParams);

      this.loadingOverlayService.activate();
      this.ccService.generateListaClientesReporte(terminos, formato)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          (res) => {
            const mimeType = formato === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf';
            const file = new Blob([res], {type: mimeType});
            saveAs(file, `clientes.${formato}`);
          },
          () => this.mensajeService.msg('Error al generar el reporte', MensajeModalType.ERROR),
        );
    }, () => { return; });
  }

  irACtaCte(cliente: Cliente) {
    this.router.navigate(['/clientes/cuenta-corriente', cliente.idCliente]);
  }

  setPredeterminado(cliente: Cliente) {
    if (!this.hasRoleToSetPredeterminado) {
      this.mensajeService.msg('No posee permiso establecer un cliente como predeterminado.', MensajeModalType.ERROR);
      return;
    }

    const msg = [
      `¿Está seguro de establecer al cliente: "${cliente.nombreFiscal}" como cliente predeterminado?`
    ].join('');

    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        if (!cliente.predeterminado) {
          this.loadingOverlayService.activate();
          this.clientesService.setClientePredeterminado(cliente.idCliente)
            .subscribe(
              () => location.reload(),
              err => {
                this.loadingOverlayService.deactivate();
                this.mensajeService.msg(err.error, MensajeModalType.ERROR);
              },
            )
          ;
        }
      }
    });
  }

  editarCliente(cliente: Cliente) {
    this.router.navigate(['/clientes/editar', cliente.idCliente]);
  }

  eliminarCliente(cliente: Cliente) {
    if (!this.hasRoleToDelete) {
      this.mensajeService.msg('No posee permiso para eliminar clientes.', MensajeModalType.ERROR);
      return;
    }

    const msg = [
      `¿Está seguro que desea eliminar el cliente: "${cliente.nombreFiscal}"?<br>`,
      `El usuario ${cliente.nombreCredencial} será desvinculado del cliente.`
    ].join('');

    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.clientesService.deleteCliente(cliente.idCliente)
          .subscribe(
            // no se hace this.loadingOverlayService.deactivate() porque necesita que se recargue el reload
            () => location.reload(),
            err => {
              this.loadingOverlayService.deactivate();
              this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            },
          )
        ;
      }
    });
  }
}
