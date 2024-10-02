import { Component } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-purchase-statistics-year',
  templateUrl: './chart-purchase-statistics-year.component.html',
  styleUrls: ['./chart-purchase-statistics-year.component.scss']
})
export class ChartPurchaseStatisticsYearComponent extends ChartDirectiveDirective {

  constructor(protected chartData: ChartService) {
    super(chartData);
  }

  override loadChartData(): void {
    this.chartData.getChartDataAnnual().subscribe(data => {
      const labels = this.generateYearData().slice(-4);
      this.updateChart(data, labels.map(String));
    });
  }
}
