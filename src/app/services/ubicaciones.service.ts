import { Pagination } from './../models/pagination';
import { BusquedaLocalidadCriteria } from './../models/criterias/busqueda-localidad-criteria';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ubicacion } from '../models/ubicacion';
import { Observable } from 'rxjs';
import { Provincia } from '../models/provincia';
import { Localidad } from '../models/localidad';
import { environment } from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class UbicacionesService {

  url = environment.apiUrl + '/api/v1/ubicaciones';
  urlBusquedaLocalidades = this.url + '/localidades/busqueda/criteria';

  constructor(private http: HttpClient) {}

  getUbicacion(idUbicacion: number): Observable<Ubicacion> {
    return this.http.get<Ubicacion>(this.url + `/${idUbicacion}`);
  }

  getProvincias(): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(`${this.url}/provincias`);
  }

  getLocalidades(idProvincia): Observable<Localidad[]> {
    return this.http.get<Localidad[]>(`${this.url}/localidades/provincias/${idProvincia}`);
  }

  getLocalidad(idLocalidad: number): Observable<Localidad> {
    return this.http.get<Localidad>(`${this.url}/localidades/${idLocalidad}`)
  }

  buscarLocalidades(criteria: BusquedaLocalidadCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(`${this.urlBusquedaLocalidades}`, criteria);
  }

  updateLocalidad(l: Localidad): Observable<void> {
    return this.http.put<void>(`${this.url}/localidades`, l);
  }
}
