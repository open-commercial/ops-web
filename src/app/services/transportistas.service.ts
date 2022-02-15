import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Transportista } from '../models/transportista';
import {BusquedaTransportistaCriteria} from '../models/criterias/busqueda-transportista-criteria';
import {Pagination} from '../models/pagination';

@Injectable({
  providedIn: 'root'
})
export class TransportistasService {
  public url = environment.apiUrl + '/api/v1/transportistas';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) { }

  buscar(criteria: BusquedaTransportistaCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  getTransportistas(): Observable<Transportista[]> {
    return this.http.get<Transportista[]>(this.url);
  }

  getTransportista(idTransportista: number): Observable<Transportista> {
    return this.http.get<Transportista>(`${this.url}/${idTransportista}`);
  }

  eliminarTransportista(idTransportista: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idTransportista}`);
  }
}
