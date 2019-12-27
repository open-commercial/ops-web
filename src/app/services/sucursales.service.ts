import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Sucursal } from '../models/sucursal';
import { environment } from '../../environments/environment';
import { HelperService } from './helper.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class SucursalesService {
  public url = environment.apiUrl + '/api/v1/sucursales';

  private sucursalSubject = new Subject<Sucursal>();
  sucursal$ = this.sucursalSubject.asObservable();

  constructor(private http: HttpClient,
              private storageService: StorageService) { }

  getIdSucursal() {
    return this.storageService.getItem('idSucursal');
  }

  setIdSucursal(idSucursal: string) {
    this.storageService.setItem('idSucursal', idSucursal);
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
}