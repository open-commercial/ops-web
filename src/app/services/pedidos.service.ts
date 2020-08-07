import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Pedido } from '../models/pedido';
import { Pagination } from '../models/pagination';
import { NuevoRenglonPedido } from '../models/nuevo-renglon-pedido';
import { RenglonPedido } from '../models/renglon-pedido';
import { NuevosResultadosComprobante } from '../models/nuevos-resultados-comprobante';
import { Resultados } from '../models/resultados';
import { DetallePedido } from '../models/detalle-pedido';
import { BusquedaPedidoCriteria } from '../models/criterias/busqueda-pedido-criteria';
@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  url = environment.apiUrl + '/api/v1/pedidos';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) { }

  buscar(criteria: BusquedaPedidoCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  getPedido(idPedido: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.url}/${idPedido}`);
  }

  getPedidoPdf(idPedido: number): Observable<Blob> {
    return this.http.get(`${this.url}/${idPedido}/reporte`, { responseType: 'blob' });
  }

  calcularRenglones(renglones: NuevoRenglonPedido[], idCliente: number): Observable<RenglonPedido[]> {
    return this.http.post<RenglonPedido[]>(`${this.url}/renglones/clientes/${idCliente}`, renglones);
  }

  calcularResultadosPedido(nrp: NuevosResultadosComprobante): Observable<Resultados> {
    return this.http.post<Resultados>(`${this.url}/calculo-pedido`, nrp);
  }

  guardarPedido(np: DetallePedido): Observable<Pedido> {
    const method = np.idPedido ? 'put' : 'post';
    return this.http[method]<Pedido>(this.url, np);
  }

  cancelarPedido(idPedido: number): Observable<void> {
    return this.http.put<void>(this.url + `/${idPedido}`, {});
  }

  getRenglonesDePedido(idPedido: number, clonar: boolean = false): Observable<RenglonPedido[]> {
    return this.http.get<RenglonPedido[]>(this.url + `/${idPedido}/renglones` + (clonar ? '?clonar=true' : ''));
  }
}
