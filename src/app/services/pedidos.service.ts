import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Pedido } from '../models/pedido';
import { Pagination } from '../models/pagination';
import { SucursalesService } from './sucursales.service';
import { NuevoRenglonPedido } from '../models/nuevo-renglon-pedido';
import { RenglonPedido } from '../models/renglon-pedido';
import { NuevosResultadosPedido } from '../models/nuevos-resultados-pedido';
import { Resultados } from '../models/resultados';
import { DetallePedido } from '../models/detalle-pedido';
import { BusquedaPedidoCriteria } from '../models/criterias/busqueda-pedido-criteria';
@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  url = environment.apiUrl + '/api/v1/pedidos';
  urlBusqueda = this.url + '/busqueda/criteria';

  static createBusquedaCriteriaObject(terminos: any = {}, page = 0): BusquedaPedidoCriteria {
    terminos.pagina = page;
    return terminos;
  }

  constructor(private http: HttpClient) { }

  buscar(terminos: any = {}, pagina: number = 0): Observable<Pagination> {
    const criteria = PedidosService.createBusquedaCriteriaObject(terminos, pagina);
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  /*getPedidosCliente(cliente: Cliente, pagina: number) {
    return this.http.get(this.urlBusqueda + '&idCliente=' + cliente.idCliente + '&pagina=' + pagina);
  }*/

  getPedido(idPedido: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.url}/${idPedido}`);
  }

  getPedidoPdf(idPedido: number): Observable<Blob> {
    return this.http.get(`${this.url}/${idPedido}/reporte`, {responseType: 'blob'});
  }

  calcularRenglones(renglones: NuevoRenglonPedido[], idCliente: number): Observable<Array<RenglonPedido>> {
    return this.http.post<Array<RenglonPedido>>(`${this.url}/renglones/clientes/${idCliente}`, renglones);
  }

  calcularResultadosPedido(nrp: NuevosResultadosPedido): Observable<Resultados> {
    return this.http.post<Resultados>(`${this.url}/calculo-pedido`, nrp);
  }

  savePedido(np: DetallePedido): Observable<Pedido> {
    const method = np.idPedido ? 'put' : 'post';
    return this.http[method]<Pedido>(this.url, np);
  }

  eliminarPedido(idPedido: number): Observable<void> {
    return this.http.delete<void>(this.url + `/${idPedido}`);
  }

  getRenglonesDePedido(idPedido: number): Observable<RenglonPedido[]> {
    return this.http.get<RenglonPedido[]>(this.url + `/${idPedido}/renglones`);
  }
}
