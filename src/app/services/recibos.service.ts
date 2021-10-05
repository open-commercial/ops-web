import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Recibo} from '../models/recibo';

@Injectable({
  providedIn: 'root'
})
export class RecibosService {

  url = environment.apiUrl + '/api/v1/recibos';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) { }

  getRecibo(idRecibo: number): Observable<Recibo> {
    return this.http.get<Recibo>(`${this.url}/${idRecibo}`);
  }

  getReporteRecibo(idRecibo: number): Observable<Blob> {
    return this.http.get(`${this.url}/${idRecibo}/reporte`, {responseType: 'blob'});
  }

  eliminarRecibo(idRecibo: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idRecibo}`);
  }
}
