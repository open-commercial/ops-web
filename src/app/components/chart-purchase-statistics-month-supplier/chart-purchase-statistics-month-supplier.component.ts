import { Component } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-purchase-statistics-month-supplier',
  templateUrl: './chart-purchase-statistics-month-supplier.component.html',
  styleUrls: ['./chart-purchase-statistics-month-supplier.component.scss']
})
export class ChartPurchaseStatisticsMonthSupplierComponent extends ChartDirectiveDirective {
  constructor(protected chartData: ChartService) {
    super(chartData);
  }


  loadChartData(year: number, month: number): void {
    this.chartData.getChartDataMonthSupplier(year, month).subscribe({
      next: (data) => {
        if (data && data.labels && data.datasets && data.datasets.length > 0) {
          const labels = data.labels;
          const datasetData = data.datasets[0].data;

          if (labels.length === datasetData.length) {
            this.suppliers = labels.map((label, index) => ({
              entidad: label,
              monto: datasetData[index],
            }));
          } else {
            console.log('Desajuste en la longitud de los datos');
            this.suppliers = [];
          }
        } (error) => {
          console.log('Error al cargar los datos', error);
          this.suppliers = [];
        }
      },
    })
  }
}
