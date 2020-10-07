import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BusquedaCajaCriteria } from '../models/criterias/busqueda-caja-criteria';
import { Pagination } from '../models/pagination';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CajasService {
  url = environment.apiUrl + '/api/v1/cajas';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) { }

  getCajas(criteria: BusquedaCajaCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }
}
