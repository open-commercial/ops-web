import {Component, OnInit, ViewChild} from '@angular/core';
import {ListadoDirective} from '../../directives/listado.directive';
import {Observable} from 'rxjs';
import {Pagination} from '../../models/pagination';
import {ActivatedRoute, Router} from '@angular/router';
import {SucursalesService} from '../../services/sucursales.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {UntypedFormBuilder} from '@angular/forms';
import {RemitosService} from '../../services/remitos.service';
import {BusquedaRemitoCriteria} from '../../models/criterias/busqueda-remito-criteria';
import * as moment from 'moment';
import {HelperService} from '../../services/helper.service';
import {FiltroOrdenamientoComponent} from '../filtro-ordenamiento/filtro-ordenamiento.component';
import {map} from 'rxjs/operators';
import {Cliente} from '../../models/cliente';
import {Usuario} from '../../models/usuario';
import {Transportista} from '../../models/transportista';
import {TransportistasService} from '../../services/transportistas.service';
import {UsuariosService} from '../../services/usuarios.service';
import {ClientesService} from '../../services/clientes.service';
import {Rol} from '../../models/rol';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-remitos',
  templateUrl: './remitos.component.html',
  styleUrls: ['./remitos.component.scss']
})
export class RemitosComponent extends ListadoDirective implements OnInit {

  ordenArray = [
    { val: 'fecha', text: 'Fecha Remito' },
    { val: 'transportista.nombre', text: 'Transportista' },
    { val: 'costoDeEnvio', text: 'Costo' },
  ];

  sentidoArray = [
    { val: 'DESC', text: 'Descendente' },
    { val: 'ASC', text: 'Ascendente' },
  ];

  ordenarPorAplicado = '';
  sentidoAplicado = '';
  @ViewChild('ordernarPorR') ordenarPorRElement: FiltroOrdenamientoComponent;
  @ViewChild('sentidoR') sentidoRElement: FiltroOrdenamientoComponent;

  allowedRolesToDelete: Rol[] = [ Rol.ADMINISTRADOR ];
  hasRoleToDelete = false;

  helper = HelperService; // se hace esto para poder usarlo en la vista.

  rolesForUsuarioFilter = [Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR];

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              private fb: UntypedFormBuilder,
              private remitosService: RemitosService,
              private transportistasService: TransportistasService,
              private usuariosService: UsuariosService,
              private clientesService: ClientesService,
              private authService: AuthService) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
  }

  populateFilterForm(ps) {
    super.populateFilterForm(ps);

    const aux = { desde: null, hasta: null };
    if (ps.fechaDesde) {
      const d = moment.unix(ps.fechaDesde).local();
      aux.desde = { year: d.year(), month: d.month() + 1, day: d.date() };
    }

    if (ps.fechaHasta) {
      const h = moment.unix(ps.fechaHasta).local();
      aux.hasta = { year: h.year(), month: h.month() + 1, day: h.date() };
    }

    this.filterForm.get('rangoFecha').setValue(aux);
  }

  getTerminosFromQueryParams(ps) {
    const terminos: BusquedaRemitoCriteria = {
      idSucursal: Number(this.sucursalesService.getIdSucursal()),
      pagina: this.page,
    };

    const { orden, sentido } = this.getDefaultOrdenYSentido();
    const config = {
      fechaDesde: { checkNaN: true, callback: HelperService.timestampToDate },
      fechaHasta: { checkNaN: true, callback: HelperService.timestampToDate },
      serieRemito: { checkNaN: true },
      nroRemito: { checkNaN: true },
      idTransportista: { checkNaN: true },
      idUsuario: { checkNaN: true },
      idCliente: { checkNaN: true },
      ordenarPor: { defaultValue: orden },
      sentido: { defaultValue: sentido },
    };

    return HelperService.paramsToTerminos<BusquedaRemitoCriteria>(ps, config , terminos);
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      rangoFecha: null,
      serieRemito: null,
      nroRemito: null,
      idTransportista: null,
      idUsuario: null,
      idCliente: null,
      ordenarPor: '',
      sentido: '',
    });
  }

  resetFilterForm() {
    this.filterForm.reset({
      rangoFecha: null,
      serieRemito: null,
      nroRemito: null,
      idTransportista: null,
      idUsuario: null,
      idCliente: null,
      ordenarPor: '',
      sentido: '',
    });
  }

  getAppliedFilters() {
    const values = this.filterForm.value;
    this.appliedFilters = [];

    if (values.rangoFecha && values.rangoFecha.desde) {
      this.appliedFilters.push({
        label: 'Fecha (desde)', value: HelperService.getFormattedDateFromNgbDate(values.rangoFecha.desde)
      });
    }

    if (values.rangoFecha && values.rangoFecha.hasta) {
      this.appliedFilters.push({
        label: 'Fecha (hasta)', value: HelperService.getFormattedDateFromNgbDate(values.rangoFecha.hasta)
      });
    }

    if (values.serieRemito || values.nroRemito) {
      this.appliedFilters.push({ label: 'Nº Remito', value: HelperService.formatNumRemito(values.serieRemito, values.nroRemito) });
    }

    if (values.idTransportista) {
      this.appliedFilters.push({
        label: 'Transportista', value: values.idTransportista, asyncFn: this.getTransportistaInfoAsync(values.idTransportista)
      });
    }

    if (values.idUsuario) {
      this.appliedFilters.push({ label: 'Usuario', value: values.idUsuario, asyncFn: this.getUsuarioInfoAsync(values.idUsuario) });
    }

    if (values.idCliente) {
      this.appliedFilters.push({ label: 'Cliente', value: values.idCliente, asyncFn: this.getClienteInfoAsync(values.idCliente) });
    }

    setTimeout(() => {
      this.ordenarPorAplicado = this.ordenarPorRElement ? this.ordenarPorRElement.getTexto() : '';
      this.sentidoAplicado = this.sentidoRElement ? this.sentidoRElement.getTexto() : '';
    }, 500);
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret: {[k: string]: any} = {};

    if (values.rangoFecha && values.rangoFecha.desde) {
      ret.fechaDesde = HelperService.getUnixDateFromNgbDate(values.rangoFecha.desde);
    }

    if (values.rangoFecha && values.rangoFecha.hasta) {
      ret.fechaHasta = HelperService.getUnixDateFromNgbDate(values.rangoFecha.hasta);
    }

    if (values.serieRemito) { ret.serieRemito = values.serieRemito; }
    if (values.nroRemito) { ret.nroRemito = values.nroRemito; }
    if (values.idTransportista) { ret.idTransportista = values.idTransportista; }
    if (values.idUsuario) { ret.idUsuario = values.idUsuario; }
    if (values.idCliente) { ret.idCliente = values.idCliente; }

    if (values.ordenarPor) { ret.ordenarPor = values.ordenarPor; }
    if (values.sentido) { ret.sentido = values.sentido; }

    return ret;
  }

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.remitosService.buscar(terminos as BusquedaRemitoCriteria);
  }

  getTransportistaInfoAsync(id: number) {
    return this.transportistasService.getTransportista(id).pipe(map((t: Transportista) => t.nombre));
  }

  getUsuarioInfoAsync(id: number): Observable<string> {
    return this.usuariosService.getUsuario(id).pipe(map((u: Usuario) => u.nombre + ' ' + u.apellido));
  }

  getClienteInfoAsync(id: number): Observable<string> {
    return this.clientesService.getCliente(id).pipe(map((c: Cliente) => c.nombreFiscal));
  }

  afterRemitoDelete() {
    location.reload();
  }
}
