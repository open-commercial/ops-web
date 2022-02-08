import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Recibo} from '../models/recibo';
import {BusquedaReciboCriteria} from '../models/criterias/busqueda-recibo-criteria';
import {Pagination} from '../models/pagination';

@Injectable({
  providedIn: 'root'
})
export class RecibosService {

  url = environment.apiUrl + '/api/v1/recibos';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) { }

  buscar(criteria: BusquedaReciboCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  getRecibo(idRecibo: number): Observable<Recibo> {
    return this.http.get<Recibo>(`${this.url}/${idRecibo}`);
  }

  getReporteRecibo(idRecibo: number): Observable<Blob> {
    return this.http.get(`${this.url}/${idRecibo}/reporte`, {responseType: 'blob'});
  }

  eliminarRecibo(idRecibo: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idRecibo}`);
  }

  guardarReciboCliente(recibo: Recibo): Observable<Recibo> {
    return this.http.post<Recibo>(`${this.url}/clientes`, recibo);
  }

  guardarReciboProveedor(recibo: Recibo): Observable<Recibo> {
    return this.http.post<Recibo>(`${this.url}/proveedores`, recibo);
  }
}
