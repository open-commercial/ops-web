import { Component } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-sales-statistics-year',
  templateUrl: './chart-sales-statistics-year.component.html',
  styleUrls: ['./chart-sales-statistics-year.component.scss']
})
export class ChartSalesStatisticsYearComponent extends ChartDirectiveDirective {
  chartDataArray: any[] = [];
  noDataAvailable: boolean = false;
  constructor(protected chartData: ChartService) {
    super(chartData);
  }

  override loadChartData(): void {
    this.chartData.getChartDataSalesAnnual().subscribe(data => {
      if (data && data.labels.length > 0) {
        const labels = this.generateYearData().slice(0, 4);
        this.updateChart(data, labels.map(String));
        this.chartDataArray = data.labels;
        this.noDataAvailable = false;
      } else {
        this.chartDataArray = [];
        this.noDataAvailable = true;
      }
    })
  }
}
