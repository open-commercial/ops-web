import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormaDePago } from '../models/forma-de-pago';

@Injectable({providedIn: 'root'})
export class FormasDePagoService {
  url = environment.apiUrl + '/api/v1/formas-de-pago';

  constructor(private http: HttpClient) { }

  getFormasDePago(): Observable<FormaDePago[]> {
    return this.http.get<FormaDePago[]>(this.url);
  }

  getFormaDePagoPredeterminada(): Observable<FormaDePago> {
    return this.http.get<FormaDePago>(this.url + '/predeterminada');
  }

  setFormaDePagoPredeterminada(idFormaDePago: number): Observable<void> {
    return this.http.put<void>(`${this.url}/predeterminada/${idFormaDePago}`, {});
  }
}
