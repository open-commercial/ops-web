import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BusquedaCajaCriteria } from '../models/criterias/busqueda-caja-criteria';
import { Pagination } from '../models/pagination';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {Caja} from '../models/caja';
import {SucursalesService} from './sucursales.service';
import {MovimientoCaja} from '../models/movimiento-caja';
import {HelperService} from './helper.service';

@Injectable({
  providedIn: 'root'
})
export class CajasService {
  url = environment.apiUrl + '/api/v1/cajas';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient,
              private sucursalesService: SucursalesService) { }

  getCajas(criteria: BusquedaCajaCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  getCaja(idCaja: number): Observable<Caja> {
    return this.http.get<Caja>(`${this.url}/${idCaja}`);
  }

  getTotalesFormasDePagoCaja(idCaja: number): Observable<{ [key: number]: number }> {
    return this.http.get<{ [key: number]: number }>(`${this.url}/${idCaja}/totales-formas-de-pago`);
  }

  getMovimientosCaja(idCaja: number, idFormaDePago: number): Observable<MovimientoCaja[]> {
    const qs = HelperService.getQueryString({ idFormaDePago });
    return this.http.get<MovimientoCaja[]>(`${this.url}/${idCaja}/movimientos?${qs}`);
  }

  getSaldoSistema(idCaja: number): Observable<number> {
    return this.http.get<number>(`${this.url}/${idCaja}/saldo-sistema`);
  }

  abrirCaja(saldoApertura: number): Observable<Caja> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const qs = HelperService.getQueryString({ saldoApertura });
    return this.http.post<Caja>(`${this.url}/apertura/sucursales/${idSucursal}?${qs}`, null);
  }

  reabrirCaja(idCaja: number, monto: number): Observable<void> {
    const qs = HelperService.getQueryString({ monto });
    return this.http.put<void>(`${this.url}/${idCaja}/reapertura?${qs}`, null);
  }

  cerrarCaja(idCaja: number, monto: number): Observable<Caja> {
    const qs = HelperService.getQueryString({ monto });
    return this.http.put<Caja>(`${this.url}/${idCaja}/cierre?${qs}`, null);
  }

  eliminarCaja(idCaja: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idCaja}`);
  }

  getSaldoQueAfectaCaja(idCaja: number): Observable<number> {
    return this.http.get<number>(`${this.url}/${idCaja}/saldo-afecta-caja`);
  }
}
