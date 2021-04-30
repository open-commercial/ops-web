import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Nota} from '../models/nota';

@Injectable({
  providedIn: 'root'
})
export class NotasService {
  url = environment.apiUrl + '/api/v1/notas';
  constructor(private http: HttpClient) {}

  autorizar(idNota: number): Observable<Nota> {
    return this.http.post<Nota>(`${this.url}/${idNota}/autorizacion`, {});
  }

  getReporte(idNota: number): Observable<Blob> {
    return this.http.get<Blob>(`${this.url}/${idNota}/reporte`);
  }

  eliminar(idNota: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idNota}`);
  }
}
