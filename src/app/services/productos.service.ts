import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../models/producto';
import { EmpresaService } from './empresa.service';
import { HelperService } from './helper.service';

@Injectable()
export class ProductosService {

  url = environment.apiUrl + '/api/v1/public/productos/';
  urlBusqueda = this.url + 'busqueda/criteria?idEmpresa=' + EmpresaService.getIdEmpresa();

  constructor(private http: HttpClient) {}

  getProductos(input, page: number = 0) {
    const terminos = { codigo: input, descripcion: input, pagina: page };
    return this.http.get(this.urlBusqueda + '&' + HelperService.getQueryString(terminos));
  }

  getProducto(idProducto: number): Observable<Producto> {
    return this.http.get<Producto>(this.url + idProducto);
  }
}
