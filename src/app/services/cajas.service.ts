import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BusquedaCajaCriteria } from '../models/criterias/busqueda-caja-criteria';
import { Pagination } from '../models/pagination';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {Caja} from '../models/caja';
import {SucursalesService} from './sucursales.service';

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

  abrirCaja(saldoApertura: number): Observable<Caja> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    return this.http.post<Caja>(`${this.url}/apertura/sucursales/${idSucursal}?saldoApertura=${saldoApertura}`, null);
  }
}
