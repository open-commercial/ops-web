import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RecibosService {

  url = environment.apiUrl + '/api/v1/recibos';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) { }

  getReporteRecibo(idRecibo: number) {
    return this.http.get(`${this.url}/${idRecibo}/reporte`, {responseType: 'blob'});
  }
}
