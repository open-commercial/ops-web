import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Cliente} from '../models/cliente';
import { SucursalesService } from './sucursales.service';
import { Pagination } from '../models/pagination';
import { HelperService } from './helper.service';

@Injectable()
export class ClientesService {
  url = environment.apiUrl + '/api/v1/clientes';
  urlBusqueda = this.url + '/busqueda/criteria?idEmpresa=' + SucursalesService.getIdSucursal();

  constructor(private http: HttpClient) {}

  getClientes(input, page = 0): Observable<Pagination> {
    const terminos = { nombreFiscal: input, nombreFantasia: input, nroCliente: input, pagina: page };
    return this.http.get<Pagination>(this.urlBusqueda + '&' + HelperService.getQueryString(terminos));
  }

  getClienteDelUsuario(idUsuario): Observable<Cliente> {
    return this.http.get<Cliente>(this.url + '/usuarios/' + idUsuario + '/empresas/' + environment.idEmpresa);
  }

  getCliente(idCliente): Observable<Cliente> {
    return this.http.get<Cliente>(this.url + '/' + idCliente);
  }

  saveCliente(cliente) {
    cliente.idEmpresa = SucursalesService.getIdSucursal();
    return this.http.put(this.url, cliente);
  }

  getClientePredeterminado(): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/predeterminado`);
  }
}
