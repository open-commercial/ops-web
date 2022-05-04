import { NuevaSucursal } from './../models/nueva-sucursal';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Sucursal } from '../models/sucursal';
import { environment } from '../../environments/environment';
import { HelperService } from './helper.service';
import { StorageKeys, StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class SucursalesService {
  public url = environment.apiUrl + '/api/v1/sucursales';

  private sucursalSubject = new Subject<Sucursal>();
  sucursal$ = this.sucursalSubject.asObservable();

  constructor(private http: HttpClient,
              private storageService: StorageService) { }

  getSucursalLabel(s: Sucursal) {
    if (!s) { return ''; }
    return s.nombre + (s.detalleUbicacion ? ' (' + s.detalleUbicacion + ')' : '');
  }

  getIdSucursal() {
    const idSuc = Number(this.storageService.getItem('idSucursal'));
    return isNaN(idSuc) ? null : idSuc;
  }

  setIdSucursal(idSucursal: string) {
    this.storageService.setItem(StorageKeys.ID_SUCURSAL, idSucursal);
  }

  seleccionarSucursal(s: Sucursal) {
    this.setIdSucursal(s.idSucursal.toString());
    this.sucursalSubject.next(s);
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

  persistSucursal(sucursal: NuevaSucursal): Observable<Sucursal> {
    return this.http.post<Sucursal>(this.url, sucursal);
  }

  updateSucursal(sucursal: Sucursal): Observable<void> {
    return this.http.put<void>(this.url, sucursal);
  }

  eliminarSucursal(idSucursal: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idSucursal}`);
  }

  uploadLogo(idSucursal: number, logo: number[]): Observable<string> {
    return this.http.post<string>(`${this.url}/${idSucursal}/logo`, logo);
  }
}
