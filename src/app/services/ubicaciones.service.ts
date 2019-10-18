import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Ubicacion} from '../models/ubicacion';
import {Observable} from 'rxjs';
import {Provincia} from '../models/provincia';
import {Localidad} from '../models/localidad';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UbicacionesService {

  url = environment.apiUrl + '/api/v1/ubicaciones';

  constructor(private http: HttpClient) {}

  getUbicacion(idUbicacion: number): Observable<Ubicacion> {
    return this.http.get<Ubicacion>(this.url + `/${idUbicacion}`);
  }

  getProvincias(): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(`${this.url}/provincias`);
  }

  getLocalidades(idProvincia): Observable<Localidad[]> {
    return this.http.get<Localidad[]>(`${this.url}/localidades/provincias/${idProvincia}`);
  }
}
