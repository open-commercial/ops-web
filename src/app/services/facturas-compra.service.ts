import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BusquedaFacturaCompraCriteria, TipoDeComprobante } from '../models/factura';
import { EmpresaService } from "./empresa.service";
import { Observable } from "rxjs";
import { Pagination } from "../models/pagination";

@Injectable({
  providedIn: 'root'
})
export class FacturasCompraService {
  url = environment.apiUrl + '/api/v1/facturas/compra';
  urlFacturas = environment.apiUrl + '/api/v1/facturas';
  urlBusqueda = this.url + '/busqueda/criteria';

  static createBusquedaCriteriaObject(terminos: any = {}, page = 0): BusquedaFacturaCompraCriteria {
    console.log(terminos);
    return {
      buscaPorFecha: !!(terminos.fechaDesde || terminos.fechaHasta),
      fechaDesde: terminos.fechaDesde ? terminos.fechaDesde : '',
      fechaHasta: terminos.fechaHasta ? terminos.fechaHasta : '',
      buscaPorProveedor: !!terminos.idProveedor,
      idProveedor: terminos.idProveedor ? terminos.idProveedor : '',
      buscaPorNumeroFactura: !!(terminos.numSerie || terminos.numFactura),
      numSerie: terminos.numSerie ? terminos.numSerie  : '',
      numFactura: terminos.numFactura ? terminos.numFactura : '',
      buscaPorTipoComprobante: !!terminos.tipoComprobante,
      tipoComprobante: terminos.tipoComprobante ? terminos.tipoComprobante : null,
      buscaPorProducto: !!terminos.idProducto,
      idProducto: terminos.idProducto ? terminos.idProducto : '',
      idEmpresa: + EmpresaService.getIdEmpresa(), // el signo + convierte string en number
      pagina: page,
      ordenarPor: terminos.ordenarPor ? terminos.ordenarPor : 'fecha',
      sentido: terminos.sentido ? terminos.sentido : 'DESC',
    };
  }

  constructor(private http: HttpClient) { }

  buscar(terminos: any = {}, pagina: number = 0): Observable<Pagination> {
    const criteria = FacturasCompraService.createBusquedaCriteriaObject(terminos);
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }
}
