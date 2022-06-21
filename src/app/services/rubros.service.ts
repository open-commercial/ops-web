import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Rubro } from '../models/rubro';

@Injectable({
  providedIn: 'root'
})
export class RubrosService {
  url = environment.apiUrl + '/api/v1/rubros';

  constructor(private http: HttpClient) { }

  getRubros(): Observable<Rubro[]> {
    return this.http.get<Rubro[]>(this.url);
  }

  getRubro(idRubro: number): Observable<Rubro> {
    return this.http.get<Rubro>(this.url + `/${idRubro}`);
  }

  guardarRubo(r: Rubro): Observable<Rubro|void> {
    const method = r.idRubro ? 'put': 'post';
    return this.http[method]<Rubro|void>(this.url, r);
  }

  eliminarRubro(idRubro: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idRubro}`);
  }
}
