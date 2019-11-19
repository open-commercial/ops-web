import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../models/producto';
import { HelperService } from './helper.service';
import { Pagination } from '../models/pagination';
import { BusquedaProductoCriteria } from '../models/criterias/busqueda-producto-criteria';

@Injectable()
export class ProductosService {

  url = environment.apiUrl + '/api/v1/productos/';
  urlBusqueda = this.url + 'busqueda/criteria';

  constructor(private http: HttpClient) {}

  getProductos(input, page: number = 0): Observable<Pagination> {
    const criteria: BusquedaProductoCriteria = { codigo: input, descripcion: input, pagina: page };
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  getProducto(idProducto: number): Observable<Producto> {
    return this.http.get<Producto>(this.url + idProducto);
  }

  getProductoPorCodigo(cod: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}/busqueda?` + HelperService.getQueryString({ codigo: cod }));
  }
}
