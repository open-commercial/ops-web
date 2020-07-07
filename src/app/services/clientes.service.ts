import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Cliente} from '../models/cliente';
import { Pagination } from '../models/pagination';
import { BusquedaClienteCriteria } from '../models/criterias/busqueda-cliente-criteria';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  url = environment.apiUrl + '/api/v1/clientes';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) {}

  getCliente(idCliente: number): Observable<Cliente> {
    return this.http.get<Cliente>(this.url + `/${idCliente}`);
  }

  getClientes(input, page = 0): Observable<Pagination> {
    const criteria: BusquedaClienteCriteria = {
      nombreFiscal: input, nombreFantasia: input, nroDeCliente: input, pagina: page
    };
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  saveCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(this.url, cliente);
  }

  getClientePredeterminado(): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/predeterminado`);
  }

  existeClientePredetermiando(): Observable<boolean> {
    return this.http.get<boolean>(`${this.url}/existe-predeterminado`);
  }

  getClienteDePedido(idPedido: number): Observable<Cliente> {
    return this.http.get<Cliente>(this.url + `/pedidos/${idPedido}`);
  }
}
