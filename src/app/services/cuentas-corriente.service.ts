import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { BusquedaCuentaCorrienteClienteCriteria } from '../models/criterias/busqueda-cuenta-corriente-cliente-criteria';
import { CuentaCorrienteCliente } from '../models/cuenta-corriente';

@Injectable({
  providedIn: 'root'
})
export class CuentasCorrienteService {
  url = environment.apiUrl + '/api/v1/cuentas-corriente';
  urlBusqueda = this.url + '/clientes/busqueda/criteria';

  constructor(private http: HttpClient) { }

  getCuentasCorriente(input, page: number = 0): Observable<Pagination> {
    const criteria: BusquedaCuentaCorrienteClienteCriteria = {
      nombreFiscal: input, nombreFantasia: input, nroDeCliente: input, pagina: page
    };
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  getCuentaCorriente(idCliente: number): Observable<CuentaCorrienteCliente> {
    return this.http.get<CuentaCorrienteCliente>(`${this.url}/clientes/${idCliente}`);
  }

  getCuentaCorrienteClientePredeterminado(): Observable<CuentaCorrienteCliente> {
    return this.http.get<CuentaCorrienteCliente>(`${this.url}/clientes/predeterminado`);
  }
}
