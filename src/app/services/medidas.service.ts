import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medida } from '../models/medida';

@Injectable({
  providedIn: 'root'
})
export class MedidasService {

  url = environment.apiUrl + '/api/v1/medidas';

  constructor(private http: HttpClient) { }

  getMedidas(): Observable<Medida[]> {
    return this.http.get<Medida[]>(this.url);
  }

  getMedida(idMedida: number): Observable<Medida> {
    return this.http.get<Medida>(`${this.url}/${idMedida}`);
  }

  guardarMedida(medida: Medida): Observable<Medida|void> {
    const method = medida.idMedida ? 'put' : 'post';
    return this.http[method]<Medida|void>(this.url, medida);
  }

  eliminarMedida(idMedida: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idMedida}`);
  }
}
