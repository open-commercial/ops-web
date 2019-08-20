import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Pedido} from '../models/pedido';
import { Pagination } from '../models/pagination';
import { EmpresaService } from './empresa.service';
import { HelperService } from './helper.service';
@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  url = environment.apiUrl + '/api/v1/pedidos';
  urlBusqueda = this.url + '/busqueda/criteria?idEmpresa=' + EmpresaService.getIdEmpresa();

  constructor(private http: HttpClient) { }

  buscar(terminos: any = {}, pagina: number = 0): Observable<Pagination> {
    terminos.pagina = pagina;
    return this.http.get<Pagination>(this.urlBusqueda + '&' + HelperService.getQueryString(terminos));
  }

  /*getPedidosCliente(cliente: Cliente, pagina: number) {
    return this.http.get(this.urlBusqueda + '&idCliente=' + cliente.id_Cliente + '&pagina=' + pagina);
  }

  getPedidoPdf(pedido: Pedido): Observable<Blob> {
    return this.http.get(`${this.url}/${pedido.id_Pedido}/reporte`, {responseType: 'blob'});
  }*/
}
