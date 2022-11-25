import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Nota, NotaCredito, NotaDebito} from '../models/nota';
import {BusquedaNotaCriteria} from '../models/criterias/busqueda-nota-criteria';
import {Pagination} from '../models/pagination';
import {TipoDeComprobante} from '../models/tipo-de-comprobante';
import {NuevaNotaCreditoSinFactura} from '../models/nueva-nota-credito-sin-factura';
import {HelperService} from './helper.service';
import {NuevaNotaCreditoDeFactura} from '../models/nueva-nota-credito-de-factura';
import {NuevaNotaDebitoSinRecibo} from '../models/nueva-nota-debito-sin-recibo';
import {NuevaNotaDebitoDeRecibo} from '../models/nueva-nota-debito-de-recibo';

@Injectable({
  providedIn: 'root'
})
export class NotasService {
  url = environment.apiUrl + '/api/v1/notas';

  urlNotaCredito = this.url + '/credito';
  urlNotaCreditoBusqueda = this.urlNotaCredito + '/busqueda/criteria';

  urlNotaDebito = this.url + '/debito';
  urlNotaDebitoBusqueda = this.urlNotaDebito + '/busqueda/criteria';

  constructor(private http: HttpClient) {}

  // NOTAS
  getNota(idNota: number): Observable<Nota> {
    return this.http.get<Nota>(`${this.url}/${idNota}`);
  }

  autorizar(idNota: number): Observable<Nota> {
    return this.http.post<Nota>(`${this.url}/${idNota}/autorizacion`, {});
  }

  getReporte(idNota: number): Observable<Blob> {
    return this.http.get<Blob>(`${this.url}/${idNota}/reporte`, { responseType: 'blob' as 'json' });
  }

  eliminar(idNota: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idNota}`);
  }

  totalIvaCredito(criteria: BusquedaNotaCriteria): Observable<number> {
    return this.http.post<number>(`${this.url}/total-iva-credito/criteria`, criteria);
  }

  totalCredito(criteria: BusquedaNotaCriteria): Observable<number> {
    return this.http.post<number>(`${this.url}/total-credito/criteria`, criteria);
  }

  // NOTAS CREDITO VENTA
  buscarNotasCredito(criteria: BusquedaNotaCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(this.urlNotaCreditoBusqueda, criteria);
  }

  getTiposDeNotaCreditoSucursal(idSucursal: number): Observable<TipoDeComprobante[]> {
    return this.http.get<TipoDeComprobante[]>(`${this.urlNotaCredito}/tipos/sucursales/${idSucursal}`);
  }

  getTiposDeNotaCreditoClienteSucursal(idCliente: number, idSucursal: number): Observable<TipoDeComprobante[]> {
    const qs = HelperService.getQueryString({ idCliente, idSucursal });
    return this.http.get<TipoDeComprobante[]>(`${this.url}/clientes/tipos/credito?${qs}`);
  }

  calcularNotaCreditoSinFactura(nncsf: NuevaNotaCreditoSinFactura): Observable<NotaCredito> {
    return this.http.post<NotaCredito>(`${this.urlNotaCredito}/calculos-sin-factura`, nncsf);
  }

  calcularNotaCreditoDeFactura(nncf: NuevaNotaCreditoDeFactura): Observable<NotaCredito> {
    return this.http.post<NotaCredito>(`${this.urlNotaCredito}/calculos`, nncf);
  }

  crearNotaCreditoSinFactura(nncsf: NuevaNotaCreditoSinFactura): Observable<NotaCredito> {
    return this.http.post<NotaCredito>(`${this.urlNotaCredito}/sin-factura`, nncsf);
  }

  crearNotaCreditoDeFactura(nncf: NuevaNotaCreditoDeFactura): Observable<NotaCredito> {
    return this.http.post<NotaCredito>(`${this.urlNotaCredito}/factura`, nncf);
  }

  // NOTAS DEBITO VENTA
  buscarNotasDebito(criteria: BusquedaNotaCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(this.urlNotaDebitoBusqueda, criteria);
  }

  getTiposDeNotaDebitoSucursal(idSucursal: number): Observable<TipoDeComprobante[]> {
    return this.http.get<TipoDeComprobante[]>(`${this.urlNotaDebito}/tipos/sucursales/${idSucursal}`);
  }

  getTiposDeNotaDebitoClienteSucursal(idCliente: number, idSucursal: number): Observable<TipoDeComprobante[]> {
    const qs = HelperService.getQueryString({ idCliente, idSucursal });
    return this.http.get<TipoDeComprobante[]>(`${this.url}/clientes/tipos/debito?${qs}`);
  }

  calcularNotaDebitoSinRecibo(nndsr: NuevaNotaDebitoSinRecibo): Observable<NotaDebito> {
    return this.http.post<NotaDebito>(`${this.urlNotaDebito}/calculos-sin-recibo`, nndsr);
  }

  calcularNotaDebitoDeRecibo(nndr: NuevaNotaDebitoDeRecibo): Observable<NotaDebito> {
    return this.http.post<NotaDebito>(`${this.urlNotaDebito}/calculos`, nndr);
  }

  crearNotaDebitoSinRecibo(nndsr: NuevaNotaDebitoSinRecibo): Observable<NotaDebito> {
    return this.http.post<NotaDebito>(`${this.urlNotaDebito}/sin-recibo`, nndsr);
  }

  crearNotaDebitoDeRecibo(nndr: NuevaNotaDebitoDeRecibo): Observable<NotaDebito> {
    return this.http.post<NotaDebito>(this.urlNotaDebito, nndr);
  }

  getTiposDeNotaCreditoProveedorSucursal(idProveedor: number, idSucursal: number): Observable<TipoDeComprobante[]> {
    const qs = HelperService.getQueryString({ idProveedor, idSucursal });
    return this.http.get<TipoDeComprobante[]>(`${this.url}/proveedores/tipos/credito?${qs}`);
  }

  getTiposDeNotaDebitoProveedorSucursal(idProveedor: number, idSucursal: number): Observable<TipoDeComprobante[]> {
    const qs = HelperService.getQueryString({ idProveedor, idSucursal });
    return this.http.get<TipoDeComprobante[]>(`${this.url}/proveedores/tipos/debito?${qs}`);
  }
}
