import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BusquedaRemitoCriteria } from '../models/criterias/busqueda-remito-criteria';
import { Pagination } from '../models/pagination';
import {Remito} from '../models/remito';
import {RenglonRemito} from '../models/renglon-remito';
import {NuevoRemito} from '../models/nuevo-remito';

@Injectable({
  providedIn: 'root'
})
export class RemitosService {
  url = environment.apiUrl + '/api/v1/remitos';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) { }

  buscar(criteria: BusquedaRemitoCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  getRemito(idRemito: number): Observable<Remito> {
    return this.http.get<Remito>(`${this.url}/${idRemito}`);
  }

  getRenglonesDeRemito(idRemito: number): Observable<RenglonRemito[]> {
    return this.http.get<RenglonRemito[]>(`${this.url}/${idRemito}/renglones`);
  }

  eliminarRemito(idRemito: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idRemito}`);
  }

  getRemitoPdf(idRemito: number): Observable<Blob> {
    return this.http.get(`${this.url}/${idRemito}/reporte`, { responseType: 'blob' });
  }

  crearRemitosDeFacturasVenta(nuevoRemito: NuevoRemito): Observable<Remito> {
    return this.http.post<Remito>(this.url, nuevoRemito);
  }
}
