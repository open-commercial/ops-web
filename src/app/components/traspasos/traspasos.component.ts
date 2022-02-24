import { Component, OnInit, ViewChild } from '@angular/core';
import { ListadoDirective } from '../../directives/listado.directive';
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
import { saveAs } from 'file-saver';
import {Producto} from '../../models/producto';
import {ProductosService} from '../../services/productos.service';

@Component({
  selector: 'app-traspasos',
  templateUrl: './traspasos.component.html'
})
export class TraspasosComponent extends ListadoDirective implements OnInit {
  ordenArray = [
    { val: 'fechaDeAlta', text: 'Fecha Traspaso' },
    { val: 'nroTraspaso', text: 'Nº Traspaso' },
    { val: 'idSucursalOrigen', text: 'Sucursal Origen' },
    { val: 'idSucursalDestino', text: 'Sucursal Destino' },
  ];

  sentidoArray = [
    { val: 'DESC', text: 'Descendente' },
    { val: 'ASC', text: 'Ascendente' },
  ];

  ordenarPorAplicado = '';
  sentidoAplicado = '';
  @ViewChild('ordernarPorT') ordenarPorTElement: FiltroOrdenamientoComponent;
  @ViewChild('sentidoT') sentidoTElement: FiltroOrdenamientoComponent;

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              public loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              private fb: FormBuilder,
              private traspasosService: TraspasosService,
              private productosService: ProductosService,
              private usuariosService: UsuariosService) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
  }

  ngOnInit() {
    super.ngOnInit();
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
    const terminos: BusquedaTraspasoCriteria = {
      pagina: this.page,
    };
    const { orden, sentido } = this.getDefaultOrdenYSentido();
    const config = {
      idProducto: { checkNaN: true },
      idUsuario: { checkNaN: true },
      fechaDesde: { checkNaN: true, callback: HelperService.timestampToDate },
      fechaHasta: { checkNaN: true, callback: HelperService.timestampToDate },
      ordenarPor: { defaultValue: orden },
      sentido: { defaultValue: sentido },
    };

    return HelperService.paramsToTerminos<BusquedaTraspasoCriteria>(ps, config , terminos);
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      rangoFecha: null,
      nroTraspaso: '',
      nroPedido: '',
      idProducto: null,
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
      idProducto: null,
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
    if (values.idProducto) { ret.idProducto = values.idProducto; }
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

    if (values.idProducto) {
      this.appliedFilters.push({ label: 'Producto', value: values.idProducto, asyncFn: this.getProductoInfoAsync(values.idProducto) });
    }

    if (values.idUsuario) {
      this.appliedFilters.push({ label: 'Usuario', value: values.idUsuario, asyncFn: this.getUsuarioInfoAsync(values.idUsuario) });
    }

    setTimeout(() => {
      this.ordenarPorAplicado = this.ordenarPorTElement ? this.ordenarPorTElement.getTexto() : '';
      this.sentidoAplicado = this.sentidoTElement ? this.sentidoTElement.getTexto() : '';
    }, 500);
  }

  getProductoInfoAsync(id: number): Observable<string> {
    return this.productosService.getProducto(id).pipe(map((p: Producto) => p.descripcion));
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
    }, () => { return; });
  }

  downloadReporteTraspasoPdf() {
    const terminos = this.getTerminosFromQueryParams(this.route.snapshot.queryParams);
    this.loadingOverlayService.activate();
    this.traspasosService.getReporteTraspaso(terminos)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (res) => {
          const file = new Blob([res], {type: 'application/pdf'});
          saveAs(file, `reporte-traspaso.pdf`);
        },
        () => this.mensajeService.msg('Error al generar el reporte', MensajeModalType.ERROR),
      )
    ;
  }
}
