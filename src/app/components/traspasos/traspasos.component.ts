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
import { saveAs } from 'file-saver';
import {Producto} from '../../models/producto';
import {ProductosService} from '../../services/productos.service';

@Component({
  selector: 'app-traspasos',
  templateUrl: './traspasos.component.html',
  styleUrls: ['./traspasos.component.scss']
})
export class TraspasosComponent extends ListadoBaseComponent implements OnInit {
  ordenarPorOptionsT = [
    { val: 'fechaDeAlta', text: 'Fecha' },
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

  getTerminosFromQueryParams(ps) {
    const terminos: BusquedaTraspasoCriteria = {
      pagina: this.page,
    };

    if (ps.nroTraspaso) {
      this.filterForm.get('nroTraspaso').setValue(ps.nroTraspaso);
      terminos.nroTraspaso = ps.nroTraspaso;
    }

    if (ps.nroPedido) {
      this.filterForm.get('nroPedido').setValue(ps.nroPedido);
      terminos.nroPedido = ps.nroPedido;
    }

    if (ps.idProducto && !isNaN(ps.idProducto)) {
      this.filterForm.get('idProducto').setValue(Number(ps.idProducto));
      terminos.idProducto = Number(ps.idProducto);
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
