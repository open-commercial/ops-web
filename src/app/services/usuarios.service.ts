import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';
import { Pagination } from '../models/pagination';
import { Rol } from '../models/rol';
import { BusquedaUsuarioCriteria } from '../models/criterias/busqueda-usuario-criteria';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  url = environment.apiUrl + '/api/v1/usuarios';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) {}

  getUsuarios(input, page = 0, rols: Array<Rol> = []): Observable<Pagination> {
    const criteria: BusquedaUsuarioCriteria = {
      username: input, nombre: input, apellido: input, email: input,
      roles: rols,
      pagina: page
    };

    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  getUsuario(id: number|string): Observable<Usuario> {
    return this.http.get<Usuario>(this.url + '/' + id);
  }

  updateUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(this.url, usuario);
  }

  createUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, usuario);
  }

  setSucursalPredeterminadaDeUsuario(idUsuario: number, idSucursal: number): Observable<void> {
    return this.http.put<void>(this.url + `/${idUsuario}/sucursales/${idSucursal}`, null);
  }
}
