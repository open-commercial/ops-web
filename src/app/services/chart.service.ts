import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ChartInterface } from '../models/chart-interface';
import { environment } from 'src/environments/environment';
import { SucursalesService } from './sucursales.service';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  urlPurchasingStatistics = environment.apiUrl + '/api/v1/estadisticas/compras'
  constructor(private http: HttpClient,
              private sucursalesService: SucursalesService) {

  }

    //urlAnnualBuysStats = environment.apiUrl + '/api/v1/estadisticas/compras/monto-neto-anual/sucursales/1'
  getChartDataAnnual (): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
        const idSucursal = this.sucursalesService.getIdSucursal();
        const url = `${this.urlPurchasingStatistics}/monto-neto-anual/sucursales/${idSucursal}`;
    return this.http.get<ChartInterface[]>(url).pipe(
      map(data => {
        const labels = data.map(item => item.periodo);
        const dataset = data.map(item => item.monto);
        return{
          labels,
          datasets: [
            {data: dataset, label: 'Estadistica de compras por año'}
          ]
        }
      })
    );
  }

    //urlAnnualBuysStatsSupplier = environment.apiUrl + '/api/v1/estadisticas/compras/proveedores/monto-neto-anual/sucursales/1?anio=2020'
  getChartDataAnnualSupplier (): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const anio = new Date().getFullYear();
    const url = `${this.urlPurchasingStatistics}/proveedores/monto-neto-anual/sucursales/${idSucursal}?anio=${anio}`;
    return this.http.get<ChartInterface[]>(url).pipe(
      map(data => {
        const labels = data.map(item => item.entidad);
        const dataset = data.map(item => item.monto);
        return{
          labels,
          datasets: [
            {data: dataset, label: 'Estadistica de compras por año por proveedor'}
          ]
        }
      })
    );
  }

   //urlMonthBuysStats = environment.apiUrl + '/api/v1/estadisticas/compras/monto-neto-mensual/sucursales/1?anio=2021'

  getChartDataMonth (year: number): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlPurchasingStatistics}/monto-neto-mensual/sucursales/${idSucursal}?anio=${year}`;
    return this.http.get<ChartInterface[]>(url).pipe(
      map(data => {
        const labels = data.map(item => item.periodo);
        const dataset = data.map(item => item.monto);
        return{
          labels,
          datasets: [
            {data: dataset, label: 'Estadistica de compras por mes'}
          ]
        }
      })
    );
  }

  //urlMonthBuysStatsSupplier = environment.apiUrl + '/api/v1/estadisticas/compras/proveedores/monto-neto-mensual/sucursales/1?anio=2020&mes=2'
  getChartDataMonthSupplier (): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const anio = new Date().getFullYear();
    const mes = new Date().getMonth();
    const url = `${this.urlPurchasingStatistics}/proveedores/monto-neto-mensual/sucursales/${idSucursal}?anio=${anio}&mes=${mes}`;
    console.log('Request url: ', url)
    return this.http.get<ChartInterface[]>(url).pipe(
      map(data => {
        const labels = data.map(item => item.entidad);
        const dataset = data.map(item => item.monto);
        return{
          labels,
          datasets: [
            {data: dataset, label: 'Estadistica de compras por mes por proveedor'}
          ]
        }
      })
    );
  }

}
