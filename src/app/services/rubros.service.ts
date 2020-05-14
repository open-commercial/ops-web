import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Rubro } from '../models/rubro';

@Injectable({
  providedIn: 'root'
})
export class RubrosService {
  url = environment.apiUrl + '/api/v1/rubros/';

  constructor(private http: HttpClient) { }

  getRubros(): Observable<Rubro[]> {
    return this.http.get<Rubro[]>(this.url);
  }

  getRubro(idRubro: number): Observable<Rubro> {
    return this.http.get<Rubro>(this.url + `/${idRubro}`);
  }
}
