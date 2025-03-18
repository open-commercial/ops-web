import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { BusquedaProveedorCriteria } from '../models/criterias/busqueda-proveedor-criteria';
import { Proveedor } from '../models/proveedor';

@Injectable({providedIn: 'root'})
export class ProveedoresService {
  
  url = environment.apiUrl + '/api/v1/proveedores';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private readonly http: HttpClient) { }

  getProveedores(input, page = 0): Observable<Pagination> {
    const criteria: BusquedaProveedorCriteria = {
      nroProveedor: input, razonSocial: input, idFiscal: input, pagina: page
    };
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  getProveedor(idProveedor: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(this.url + `/${idProveedor}`);
  }

  guardarProveedor(proveedor: Proveedor): Observable<Proveedor> {
    const action = proveedor.idProveedor ? 'put' : 'post';
    return this.http[action]<Proveedor>(this.url, proveedor);
  }

  eliminarProveedor(idProveedor: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idProveedor}`);
  }
}
