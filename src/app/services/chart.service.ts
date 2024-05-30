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
  

  constructor(private http: HttpClient ) { }

  getChartData (): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
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
}
