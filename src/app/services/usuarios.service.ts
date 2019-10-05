import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';
import { Pagination } from '../models/pagination';
import { Rol } from '../models/rol';
import { BusquedaUsuarioCriteria } from '../models/criterias/busqueda-usuario-criteria';

@Injectable()
export class UsuariosService {

  url = environment.apiUrl + '/api/v1/usuarios';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) {}

  getUsuarios(input, page = 0, roles: Array<Rol> = []): Observable<Pagination> {
    const criteria: BusquedaUsuarioCriteria = {
      username: input, nombre: input, apellido: input, email: input,
      roles: roles,
      pagina: page
    };

    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  getUsuario(id: number|string): Observable<Usuario> {
    return this.http.get<Usuario>(this.url + '/' + id);
  }

  saveUsuario(usuario: Usuario) {
    return this.http.put(this.url, usuario);
  }
}
