import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sucursal } from '../models/sucursal';
import { environment } from '../../environments/environment';
import { HelperService } from './helper.service';

@Injectable({
  providedIn: 'root'
})
export class SucursalesService {
  public url = environment.apiUrl + '/api/v1/sucursales';

  constructor(private http: HttpClient) { }

  static getIdSucursal() {
    return localStorage.getItem('idSucursal');
  }

  static setIdSucursal(idSucursal: string) {
    localStorage.setItem('idSucursal', idSucursal);
  }

  getSucursales(): Observable<Array<Sucursal>> {
    return this.http.get<Array<Sucursal>>(this.url);
  }

  getPuntosDeRetito(): Observable<Array<Sucursal>> {
    const terminos = { puntoDeRetiro: 'true' };
    return this.http.get<Array<Sucursal>>(`${this.url}?${HelperService.getQueryString(terminos)}`);
  }

  getSucursal(idSucursal): Observable<Sucursal> {
    return this.http.get<Sucursal>(`${this.url}/${idSucursal}`);
  }
}
