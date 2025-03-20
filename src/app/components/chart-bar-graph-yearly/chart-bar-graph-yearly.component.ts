import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartDirective } from 'src/app/directives/chart.directive';
import { Sucursal } from 'src/app/models/sucursal';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-bar-graph-yearly',
  templateUrl: './chart-bar-graph-yearly.component.html',
  styleUrls: ['./chart-bar-graph-yearly.component.scss']
})
export class ChartBarGraphYearlyComponent extends ChartDirective {
  @Input() title: string = '';
  @Input() chartType: 'compras' | 'ventas' = 'compras';
  @Input() sucursal: Sucursal;

  chartDataArray: any[] = [];
  noDataAvailable: boolean = false;

  constructor(private readonly chartService: ChartService) {
    super();
  }

  override loadChartData(): void {
    this.setLoadingState(true);
    if (this.chartType === 'compras') {
      this.chartService.getChartDataPurchaseAnnual().subscribe(data => {
        this.handleData(data);
        this.setLoadingState(false);
      });
    } else if (this.chartType === 'ventas') {
      this.chartService.getChartDataSalesAnnual().subscribe(data => {
        this.handleData(data);
        this.setLoadingState(false);
      });
    }
  }

  handleData(data: any): void {

    if (data && data.labels && data.datasets) {
      const labels = this.generateYearData().slice(0, 4).map(String).sort();
      const dataMap = new Map(
        data.labels.map((label: number | string, index: number) => [String(label), data.datasets[0].data[index]])
      );
      const synchronizedData = labels.map((label) => dataMap.get(label) ?? 0);

      if (!Array.isArray(data.datasets) || data.datasets.length === 0) {
        this.chartDataArray = [];
        this.noDataAvailable = true;
        this.setLoadingState(false);
        return;
      }

      const updatedDatasets = data.datasets.map((dataset: any) => ({
        ...dataset,
        data: synchronizedData,
      }));

      this.updateChart({ ...data, labels, datasets: updatedDatasets }, labels);
      this.chartDataArray = updatedDatasets;
      this.noDataAvailable = false;
    } else {
      console.warn("No hay datos válidos para el gráfico.");
      this.chartDataArray = [];
      this.noDataAvailable = true;
    }

    this.setLoadingState(false);
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sucursal'] && changes['sucursal'].currentValue !== changes['sucursal'].previousValue) {
      const currentYear = new Date().getFullYear();
      this.selectedYear = currentYear;
      this.loadChartData();
    }
  }

}
