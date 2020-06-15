import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../models/producto';
import { HelperService } from './helper.service';
import { Pagination } from '../models/pagination';
import { BusquedaProductoCriteria } from '../models/criterias/busqueda-producto-criteria';
import { ProductosParaVerificarStock } from '../models/productos-para-verificar-stock';
import { ProductoFaltante } from '../models/producto-faltante';
import { CantidadEnSucursal } from '../models/cantidad-en-sucursal';
import { SucursalesService } from './sucursales.service';
import { NuevoProducto } from '../models/nuevo-producto';

@Injectable()
export class ProductosService {

  url = environment.apiUrl + '/api/v1/productos/';
  urlBusqueda = this.url + 'busqueda/criteria';

  constructor(private http: HttpClient,
              private sucursalesService: SucursalesService) {}

  buscar(criteria: BusquedaProductoCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  getProducto(idProducto: number): Observable<Producto> {
    return this.http.get<Producto>(this.url + idProducto);
  }

  getProductoPorCodigo(cod: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}/busqueda?` + HelperService.getQueryString({ codigo: cod }));
  }

  getDisponibilidadEnStock(ppvs: ProductosParaVerificarStock): Observable<ProductoFaltante[]> {
    return this.http.post<ProductoFaltante[]>(this.url + '/disponibilidad-stock', ppvs);
  }

  crearProducto(np: NuevoProducto, idMedida: number, idRubro: number, idProveedor: number): Observable<Producto> {
    const qs = HelperService.getQueryString({ idMedida, idRubro, idProveedor });
    return this.http.post<Producto>(this.url + `?${qs}`, np);
  }

  /* Helpers */
  getCantidad(p: Producto) {
    const aux: Array<CantidadEnSucursal> = p.cantidadEnSucursales.filter(
      c => c.idSucursal === Number(this.sucursalesService.getIdSucursal())
    );
    return aux.length ? aux[0].cantidad : 0;
  }
  getCantOtrasSucursales(p: Producto) {
    const aux: Array<CantidadEnSucursal> = p.cantidadEnSucursales.filter(
      c => c.idSucursal !== Number(this.sucursalesService.getIdSucursal())
    );
    let cant = 0;
    aux.forEach((ces: CantidadEnSucursal) => cant += ces.cantidad);
    return cant;
  }
  estaBonificado(p: Producto) {
    return p && p.precioBonificado && p.precioBonificado < p.precioLista;
  }

}
