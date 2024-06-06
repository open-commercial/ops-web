import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ChartInterface } from '../models/chart-interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  urlAnnualBuysStats = environment.apiUrl + '/api/v1/estadisticas/compras/monto-neto-anual/sucursales/1'
  urlAnnualBuysStatsSupplier = environment.apiUrl + '/api/v1/estadisticas/compras/proveedores/monto-neto-anual/sucursales/1?anio=2020'
  urlMonthBuysStats = environment.apiUrl + '/api/v1/estadisticas/compras/monto-neto-mensual/sucursales/1?anio=2021'
  urlMonthBuysStatsSupplier = environment.apiUrl + '/api/v1/estadisticas/compras/proveedores/monto-neto-mensual/sucursales/1?anio=2020&mes=2'
  

  constructor(private http: HttpClient ) { }

  getChartDataAnnual (): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
    return this.http.get<ChartInterface[]>(this.urlAnnualBuysStats).pipe(
      map(data => {
        const labels = data.map(item => item.periodo);
        const dataset = data.map(item => item.monto);
        return{
          labels,
          datasets: [
            {data: dataset, label: 'Estadistica de compra por año'}
          ]
        }
      })
    );
  }

  getChartDataAnnualSupplier (): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
    return this.http.get<ChartInterface[]>(this.urlAnnualBuysStatsSupplier).pipe(
      map(data => {
        const labels = data.map(item => item.entidad);
        const dataset = data.map(item => item.monto);
        return{
          labels,
          datasets: [
            {data: dataset, label: 'Estadistica de compra por año por proveedor'}
          ]
        }
      })
    );
  }

  getChartDataMonth (): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
    return this.http.get<ChartInterface[]>(this.urlMonthBuysStats).pipe(
      map(data => {
        const labels = data.map(item => item.periodo);
        const dataset = data.map(item => item.monto);
        return{
          labels,
          datasets: [
            {data: dataset, label: 'Estadistica de compra por mes'}
          ]
        }
      })
    );
  }

  getChartDataMonthSupplier (): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
    return this.http.get<ChartInterface[]>(this.urlMonthBuysStatsSupplier).pipe(
      map(data => {
        const labels = data.map(item => item.entidad);
        const dataset = data.map(item => item.monto);
        return{
          labels,
          datasets: [
            {data: dataset, label: 'Estadistica de compra por mes por proveedor'}
          ]
        }
      })
    );
  }

}
