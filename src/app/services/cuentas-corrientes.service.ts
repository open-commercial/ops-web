import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { BusquedaCuentaCorrienteClienteCriteria } from '../models/criterias/busqueda-cuenta-corriente-cliente-criteria';
import {CuentaCorrienteCliente, CuentaCorrienteProveedor} from '../models/cuenta-corriente';
import {HelperService} from './helper.service';
import {BusquedaCuentaCorrienteProveedorCriteria} from '../models/criterias/busqueda-cuenta-corriente-proveedor-criteria';

@Injectable({
  providedIn: 'root'
})
export class CuentasCorrientesService {
  url = environment.apiUrl + '/api/v1/cuentas-corriente';
  urlBusquedaCuentasCorrienteCliente = this.url + '/clientes/busqueda/criteria';
  urlBusquedaCuentasCorrienteProveedor = this.url + '/proveedores/busqueda/criteria';

  constructor(private http: HttpClient) { }

  buscarCuentasCorrientesCliente(criteria: BusquedaCuentaCorrienteClienteCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(this.urlBusquedaCuentasCorrienteCliente, criteria);
  }

  getCuentasCorrientesCliente(input, page: number = 0): Observable<Pagination> {
    const criteria: BusquedaCuentaCorrienteClienteCriteria = {
      nombreFiscal: input, nombreFantasia: input, nroDeCliente: input, pagina: page
    };
    return this.buscarCuentasCorrientesCliente(criteria);
  }

  getCuentaCorrienteCliente(idCliente: number): Observable<CuentaCorrienteCliente> {
    return this.http.get<CuentaCorrienteCliente>(`${this.url}/clientes/${idCliente}`);
  }

  getCuentaCorrienteRenglones(idCuentaCorriente: number, pagina = 0): Observable<Pagination> {
    const qs = HelperService.getQueryString({ pagina });
    return this.http.get<Pagination>(`${this.url}/${idCuentaCorriente}/renglones?${qs}`);
  }

  getCuentaCorrienteClienteSaldo(idCliente: number): Observable<number> {
    return this.http.get<number>(`${this.url}/clientes/${idCliente}/saldo`);
  }

  getCuentaCorrienteClientePredeterminado(): Observable<CuentaCorrienteCliente> {
    return this.http.get<CuentaCorrienteCliente>(`${this.url}/clientes/predeterminado`);
  }

  generateListaClientesReporte(criteria: BusquedaCuentaCorrienteClienteCriteria, formato = 'xlsx'): Observable<Blob> {
    return this.http.post<Blob>(
      `${this.url}/lista-clientes/reporte/criteria?formato=${formato}`, criteria, { responseType: 'blob' as 'json' }
    );
  }

  getReporte(criteria: BusquedaCuentaCorrienteClienteCriteria, formato = 'xlsx'): Observable<Blob> {
    return this.http.post<Blob>(`${this.url}/clientes/reporte/criteria?formato=${formato}`, criteria, { responseType: 'blob' as 'json'});
  }

  // POVEEDORES ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  buscarCuentasCorrientesProveedores(criteria: BusquedaCuentaCorrienteProveedorCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(this.urlBusquedaCuentasCorrienteProveedor, criteria);
  }

  getCuentaCorrienteProveedoer(idProveedor: number): Observable<CuentaCorrienteProveedor> {
    return this.http.get<CuentaCorrienteProveedor>(`${this.url}/proveedores/${idProveedor}`);
  }

  getCuentaCorrienteProveedorSaldo(idProveedor: number): Observable<number> {
    return this.http.get<number>(`${this.url}/proveedores/${idProveedor}/saldo`);
  }
}
