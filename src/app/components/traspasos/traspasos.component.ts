import { Component, OnInit, ViewChild } from '@angular/core';
import { ListadoBaseComponent } from '../listado-base.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SucursalesService } from '../../services/sucursales.service';
import { FormBuilder } from '@angular/forms';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { MensajeService } from '../../services/mensaje.service';
import { Observable } from 'rxjs';
import { Pagination } from '../../models/pagination';
import { FiltroOrdenamientoComponent } from '../filtro-ordenamiento/filtro-ordenamiento.component';
import { TraspasosService } from '../../services/traspasos.service';
import { BusquedaTraspasoCriteria } from '../../models/criterias/busqueda-traspaso.criteria';
import * as moment from 'moment';
import { HelperService } from '../../services/helper.service';
import { finalize, map } from 'rxjs/operators';
import { Usuario } from '../../models/usuario';
import { UsuariosService } from '../../services/usuarios.service';
import { Traspaso } from '../../models/traspaso';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-traspasos',
  templateUrl: './traspasos.component.html',
  styleUrls: ['./traspasos.component.scss']
})
export class TraspasosComponent extends ListadoBaseComponent implements OnInit {
  ordenarPorOptionsT = [
    { val: 'fechaDeAlta', text: 'Fecha Traspaso' },
    { val: 'nroTraspaso', text: 'Nº Traspaso' },
    { val: 'idSucursalOrigen', text: 'Sucursal Origen' },
    { val: 'idSucursalDestino', text: 'Sucursal Destino' },
  ];

  sentidoOptionsT = [
    { val: 'ASC', text: 'Ascendente' },
    { val: 'DESC', text: 'Descendente' },
  ];

  ordenarPorAplicado = '';
  sentidoAplicado = '';
  @ViewChild('ordernarPorT', { static: false }) ordenarPorTElement: FiltroOrdenamientoComponent;
  @ViewChild('sentidoT', { static: false }) sentidoTElement: FiltroOrdenamientoComponent;

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              public loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              private fb: FormBuilder,
              private traspasosService: TraspasosService,
              private usuariosService: UsuariosService) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  getTerminosFromQueryParams(params) {
    const terminos: BusquedaTraspasoCriteria = {
      pagina: 0,
    };

    this.resetFilterForm();
    const ps = params ? params.params : this.route.snapshot.queryParams;
    const p = Number(ps.p);

    this.page = isNaN(p) || p < 1 ? 0 : (p - 1);
    terminos.pagina = this.page;

    if (ps.nroTraspaso) {
      this.filterForm.get('nroTraspaso').setValue(ps.nroTraspaso);
      terminos.nroTraspaso = ps.nroTraspaso;
    }

    if (ps.nroPedido) {
      this.filterForm.get('nroPedido').setValue(ps.nroPedido);
      terminos.nroPedido = ps.nroPedido;
    }

    if (ps.idUsuario && !isNaN(ps.idUsuario)) {
      this.filterForm.get('idUsuario').setValue(Number(ps.idUsuario));
      terminos.idUsuario = Number(ps.idUsuario);
    }

    if (ps.fechaDesde || ps.fechaHasta) {
      const aux = { desde: null, hasta: null };

      if (ps.fechaDesde) {
        const d = moment.unix(ps.fechaDesde).local();
        aux.desde = { year: d.year(), month: d.month() + 1, day: d.date() };
        terminos.fechaDesde = d.toDate();
      }

      if (ps.fechaHasta) {
        const h = moment.unix(ps.fechaHasta).local();
        aux.hasta = { year: h.year(), month: h.month() + 1, day: h.date() };
        terminos.fechaHasta = h.toDate();
      }

      this.filterForm.get('rangoFecha').setValue(aux);
    }

    let ordenarPorVal = this.ordenarPorOptionsT.length ? this.ordenarPorOptionsT[0].val : '';
    if (ps.ordenarPor) { ordenarPorVal = ps.ordenarPor; }
    this.filterForm.get('ordenarPor').setValue(ordenarPorVal);
    terminos.ordenarPor = ordenarPorVal;

    const sentidoVal = ps.sentido ? ps.sentido : 'DESC';
    this.filterForm.get('sentido').setValue(sentidoVal);
    terminos.sentido = sentidoVal;

    return terminos;
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      rangoFecha: null,
      nroTraspaso: '',
      nroPedido: '',
      idUsuario: null,
      ordenarPor: '',
      sentido: '',
    });
  }

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.traspasosService.buscar(terminos);
  }

  resetFilterForm() {
    this.filterForm.reset({
      rangoFecha: null,
      nroTraspaso: '',
      nroPedido: '',
      idUsuario: null,
      ordenarPor: '',
      sentido: '',
    });
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

    if (values.nroTraspaso) { ret.nroTraspaso = values.nroTraspaso; }
    if (values.nroPedido) { ret.nroPedido = values.nroPedido; }
    if (values.idUsuario) { ret.idUsuario = values.idUsuario; }
    if (values.ordenarPor) { ret.ordenarPor = values.ordenarPor; }
    if (values.sentido) { ret.sentido = values.sentido; }

    return ret;
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

    if (values.nroTraspaso) {
      this.appliedFilters.push({ label: 'Nº Traspaso', value: values.nroTraspaso });
    }

    if (values.nroPedido) {
      this.appliedFilters.push({ label: 'Nº Pedido', value: values.nroPedido });
    }

    if (values.idUsuario) {
      this.appliedFilters.push({ label: 'Usuario', value: values.idUsuario, asyncFn: this.getUsuarioInfoAsync(values.idUsuario) });
    }

    setTimeout(() => {
      this.ordenarPorAplicado = this.ordenarPorTElement ? this.ordenarPorTElement.getTexto() : '';
      this.sentidoAplicado = this.sentidoTElement ? this.sentidoTElement.getTexto() : '';
    }, 500);
  }

  getUsuarioInfoAsync(id: number): Observable<string> {
    return this.usuariosService.getUsuario(id).pipe(map((u: Usuario) => u.nombre + ' ' + u.apellido));
  }

  verTraspaso(traspaso: Traspaso) {
    this.router.navigate(['/traspasos/ver', traspaso.idTraspaso]);
  }

  crearTraspaso() {
    this.router.navigate(['/traspasos/nuevo']);
  }

  eliminarTraspaso(traspaso: Traspaso) {
    const msg = `¿Está seguro que desea eliminar el traspaso #${traspaso.nroTraspaso}?`;

    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.traspasosService.eliminarTraspaso(traspaso.idTraspaso)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe(
            () => location.reload(),
            err => this.mensajeService.msg(`Error: ${err.error}`, MensajeModalType.ERROR),
          )
        ;
      }
    }, () => {});
  }
}
