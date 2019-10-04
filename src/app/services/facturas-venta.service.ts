import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SucursalesService } from './sucursales.service';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { BusquedaFacturaVentaCriteria, FacturaVenta } from '../models/factura';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FacturasVentaService {
  url = environment.apiUrl + '/api/v1/facturas/venta';
  urlBusqueda = this.url + '/busqueda/criteria';

  static createBusquedaCriteriaObject(terminos: any = {}, page = 0): BusquedaFacturaVentaCriteria {
    return {
      buscaPorFecha: !!(terminos.fechaDesde || terminos.fechaHasta),
      fechaDesde: terminos.fechaDesde ? terminos.fechaDesde : '',
      fechaHasta: terminos.fechaHasta ? terminos.fechaHasta : '',
      buscaCliente: !!terminos.idCliente,
      idCliente: terminos.idCliente ? terminos.idCliente : '',
      buscaPorTipoComprobante: !!terminos.tipoComprobante,
      tipoComprobante: terminos.tipoComprobante ? terminos.tipoComprobante : null,
      buscaUsuario: !!terminos.idUsuario,
      idUsuario: terminos.idUsuario ? terminos.idUsuario : '',
      buscaViajante: !!terminos.idViajante,
      idViajante: terminos.idViajante ? terminos.idViajante : '',
      buscaPorNumeroFactura: !!(terminos.numSerie || terminos.numFactura),
      numSerie: terminos.numSerie ? terminos.numSerie  : '',
      numFactura: terminos.numFactura ? terminos.numFactura : '',
      buscarPorPedido: !!terminos.nroPedido,
      nroPedido: terminos.nroPedido ? terminos.nroPedido : '',
      buscaPorProducto: !!terminos.idProducto,
      idProducto: terminos.idProducto ? terminos.idProducto : '',
      idEmpresa: + SucursalesService.getIdSucursal(), // el signo + convierte string en number
      pagina: page,
      ordenarPor: terminos.ordenarPor ? terminos.ordenarPor : 'fecha',
      sentido: terminos.sentido ? terminos.sentido : 'DESC',
    };
  }

  constructor(private http: HttpClient) { }

  buscar(terminos: any = {}, pagina: number = 0): Observable<Pagination> {
    const criteria = FacturasVentaService.createBusquedaCriteriaObject(terminos);
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }
}
