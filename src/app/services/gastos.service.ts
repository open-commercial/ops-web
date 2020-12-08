import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Gasto} from '../models/gasto';
import {NuevoGasto} from '../models/nuevo-gasto';

@Injectable({
  providedIn: 'root'
})
export class GastosService {

  url = environment.apiUrl + '/api/v1/gastos';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) { }

  getGasto(idGasto: number): Observable<Gasto> {
    return this.http.get<Gasto>(`${this.url}/${idGasto}`);
  }

  eliminarGasto(idGasto: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idGasto}`);
  }

  crearGasto(nuevoGasto: NuevoGasto): Observable<Gasto> {
    return this.http.post<Gasto>(this.url, nuevoGasto);
  }
}
