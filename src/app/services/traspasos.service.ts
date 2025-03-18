import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BusquedaTraspasoCriteria } from '../models/criterias/busqueda-traspaso.criteria';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { Traspaso } from '../models/traspaso';
import { RenglonTraspaso } from '../models/renglon-traspaso';
import { NuevoTraspaso } from '../models/nuevo-traspaso';

@Injectable({providedIn: 'root'})
export class TraspasosService {
  
  public url = environment.apiUrl + '/api/v1/traspasos';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) { }

  buscar(criteria: BusquedaTraspasoCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  getTraspaso(idTraspaso: number): Observable<Traspaso> {
    return this.http.get<Traspaso>(this.url + `/${idTraspaso}`);
  }

  getRenglonesDeTraspaso(idTraspaso: number): Observable<RenglonTraspaso[]> {
    return this.http.get<RenglonTraspaso[]>(this.url + `/${idTraspaso}/renglones`);
  }

  guardarTraspaso(nt: NuevoTraspaso): Observable<Traspaso> {
    return this.http.post<Traspaso>(this.url, nt);
  }

  eliminarTraspaso(idTraspaso: number): Observable<void> {
    return this.http.delete<void>(this.url + `/${idTraspaso}`);
  }

  getReporteTraspaso(criteria: BusquedaTraspasoCriteria): Observable<Blob> {
    return this.http.post<Blob>(this.url + '/reporte/criteria', criteria, { responseType: 'blob' as 'json' });
  }
}
