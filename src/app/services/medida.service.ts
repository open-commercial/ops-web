import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medida } from '../models/medida';

@Injectable({
  providedIn: 'root'
})
export class MedidaService {

  url = environment.apiUrl + '/api/v1/medidas';

  constructor(private http: HttpClient) { }

  getMedidas(): Observable<Medida[]> {
    return this.http.get<Medida[]>(this.url);
  }
}
