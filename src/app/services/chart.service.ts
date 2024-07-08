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

  //Compras por año
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

  //Compras por año por proveedor
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

  //compras por mes
  getChartDataMonth (): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const years = new Date().getFullYear();
    const url = `${this.urlPurchasingStatistics}/monto-neto-mensual/sucursales/${idSucursal}?anio=${years}`;
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

  //Compras por mes por proveedor
  getChartDataMonthSupplier(): Observable<{ labels: string[], datasets: { data: number[], label: string }[] }> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const years = new Date().getFullYear();
    const months = new Date().getMonth(); 
    const url = `${this.urlPurchasingStatistics}/proveedores/monto-neto-mensual/sucursales/${idSucursal}?anio=${years}&mes=${months}`;
 
    return this.http.get<ChartInterface[]>(url).pipe(
      map(data => {
        const labels = data.map(item => item.entidad);
        const dataset = data.map(item => item.monto);
  
        return {
          labels,
          datasets: [
            { data: dataset, label: 'Estadistica de compras por mes por proveedor' }
          ]
        };
      })
    );
  }
  

}
