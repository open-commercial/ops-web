import { Component, inject, Input, OnInit } from '@angular/core';
import { BarChartDirective } from 'src/app/directives/bar-chart.directive';
import { PeriodoMonto } from 'src/app/models/periodo-monto';
import { EstadisticasService } from 'src/app/services/estadisticas.service';

@Component({
  selector: 'app-chart-bar-graph-yearly',
  templateUrl: './chart-bar-graph-yearly.component.html',
  styleUrls: ['./chart-bar-graph-yearly.component.scss']
})
export class ChartBarGraphYearlyComponent extends BarChartDirective implements OnInit {

  @Input() title: string;
  @Input() chartType: 'compras' | 'ventas';
  noDataAvailable: boolean = false;
  estadisticasService: EstadisticasService = inject(EstadisticasService);

  ngOnInit(): void {
    super.ngOnInit();
    this.loadChartData();
  }

  override loadChartData(): void {
    this.loadingData = true;
    if (this.chartType === 'compras') {
      this.estadisticasService.getMontoNetoCompradoAnual().subscribe(data => {
        this.handleData(data);
        this.loadingData = false;
      });
    } else if (this.chartType === 'ventas') {
      this.estadisticasService.getMontoNetoVendidoAnual().subscribe(data => {
        this.handleData(data);
        this.loadingData = false;
      });
    }
  }

  private handleData(data: PeriodoMonto[]): void {
    const periodos = data.map(i => String(i.periodo)).reverse();
    const montos = data.map(i => i.monto).reverse();
    this.updateChart(periodos, [{ data: montos, label: 'Monto neto' }]);
  }

}
