import { Component, Input } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-statistics-year-supplier',
  templateUrl: './chart-statistics-year-supplier.component.html'
})
export class ChartStatisticsYearSupplierComponent extends ChartDirectiveDirective {
  @Input() title: string;
  @Input() dataType: 'compras' | 'ventas';
  constructor(protected chartData: ChartService) {
    super(chartData);
  }

  loadChartData(year: number): void {
    const chartDataPurchaseSaleSupplier = this.dataType === 'compras' ?
      this.chartData.getChartDataPurchaseAnnualSupplier(year) :
      this.chartData.getChartDataSalesAnnualSupplier(year);

    chartDataPurchaseSaleSupplier.subscribe({
      next: (data) => this.handleChartData(data),
      error: (err) => console.log('Error al cargar datos', err),
    })
  }

  isMonthOptional(): boolean {
    return true;
  }
}
