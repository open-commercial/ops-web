import { Component, Input } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-statistics-month-supplier',
  templateUrl: './chart-statistics-month-supplier.component.html',
  styleUrls: ['./chart-statistics-month-supplier.component.scss']
})
export class ChartStatisticsMonthSupplierComponent extends ChartDirectiveDirective {
  @Input() dataType: 'compras' | 'ventas';
  @Input() title: string = '';
  constructor(protected chartData: ChartService) {
    super(chartData);
  }

  loadChartData(year: number, month: number): void {
    let chartDataPurchaseSale;

    if (this.dataType === 'compras') {
      chartDataPurchaseSale = this.chartData.getChartDataMonthSupplier(year, month);
    } else if (this.dataType === 'ventas') {
      chartDataPurchaseSale = this.chartData.getChartDataSalesMonthSupplier(year, month);
    }

    chartDataPurchaseSale.subscribe({
      next: (data) => {
        if (data && data.labels && data.datasets && data.datasets.length > 0) {
          const labels = data.labels;
          const datasetData = data.datasets[0].data;

          if (labels.length === datasetData.length) {
            this.suppliers = labels.map((label, index) => ({
              entidad: label,
              monto: datasetData[index],
            }));
            this.updateChart(data, labels);
          } else {
            console.log('Desajuste en la longitud de los datos');
            this.suppliers = [];
          }
        }
      },
      error: (err) => {
        console.log('Error al cargar los datos', err);
        this.suppliers = [];
      }
    })
  }

}
