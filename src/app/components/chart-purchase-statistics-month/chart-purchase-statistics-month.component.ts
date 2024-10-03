import { Component } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-purchase-statistics-month',
  templateUrl: './chart-purchase-statistics-month.component.html',
  styleUrls: ['./chart-purchase-statistics-month.component.scss']
})
export class ChartPurchaseStatisticsMonthComponent extends ChartDirectiveDirective {
  chartDataArray: any[] = [];
  noDataAvailable: boolean = false;
  constructor(protected chartData: ChartService) {
    super(chartData);
  }

  override loadChartData(year: number): void {
    const allList = this.generateMonthsData().map(m => m.name);

    this.chartData.getChartDataMonth(year).subscribe(data => {
      if (data && data.labels.length > 0) {
        const monthList = data.labels.map(labels => allList[parseInt(labels) - 1]);
        this.updateChart(data, monthList);
        this.chartDataArray = data.labels;
        this.noDataAvailable = false;
      } else {
        this.chartDataArray = [];
        this.noDataAvailable = true;
      }
    });
  }
}
