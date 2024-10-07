import { Component, Input, OnInit } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-statistics-year',
  templateUrl: './chart-statistics-year.component.html',
  styleUrls: ['./chart-statistics-year.component.scss']
})
export class ChartStatisticsYearComponent extends ChartDirectiveDirective {
  @Input() title: string = '';
  @Input() chartType: 'compras' | 'ventas' = 'compras';
  chartDataArray: any[] = [];
  noDataAvailable: boolean = false;
  constructor(protected chartData: ChartService) {
    super(chartData);
  }

  override loadChartData(): void {
    if (this.chartType === 'compras') {
      this.chartData.getChartDataAnnual().subscribe(data => {
        this.handleData(data);
      });
    } else if (this.chartType === 'ventas') {
      this.chartData.getChartDataSalesAnnual().subscribe(data => {
        this.handleData(data);
      });
    }
  }

  handleData(data: any): void {
    if (data && data.labels.length > 0) {
      const labels = this.generateYearData().slice(0, 4);
      this.updateChart(data, labels.map(String));
      this.chartDataArray = data.labels;
      this.noDataAvailable = false;
    } else {
      this.chartDataArray = [];
      this.noDataAvailable = true;
    }
  }
}
