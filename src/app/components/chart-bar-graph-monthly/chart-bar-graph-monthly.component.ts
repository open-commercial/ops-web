import { Component, inject, Input, OnInit } from '@angular/core';
import { BarChartDirective } from 'src/app/directives/bar-chart.directive';
import { PeriodoMonto } from 'src/app/models/periodo-monto';
import { EstadisticasService } from 'src/app/services/estadisticas.service';

@Component({
  selector: 'app-chart-bar-graph-monthly',
  templateUrl: './chart-bar-graph-monthly.component.html',
  styleUrls: ['./chart-bar-graph-monthly.component.scss']
})
export class ChartBarGraphMonthlyComponent extends BarChartDirective implements OnInit {

  @Input() title: string;
  @Input() chartType: 'compras' | 'ventas';
  selectedYear: number = this.years[0];
  estadisticasService: EstadisticasService = inject(EstadisticasService);

  ngOnInit(): void {
    super.ngOnInit();
    this.loadChartData();
  }

  override loadChartData(): void {
    this.loadingData = true;
    if (this.chartType === 'compras') {
      this.estadisticasService.getMontoNetoCompradoMensual(this.selectedYear).subscribe(data => {
        this.handleData(data);
        this.loadingData = false;
      });
    }
    if (this.chartType === 'ventas') {
      this.estadisticasService.getMontoNetoVendidoMensual(this.selectedYear).subscribe(data => {
        this.handleData(data);
        this.loadingData = false;
      });
    }
  }

  private handleData(data: PeriodoMonto[]): void {
    const monthsAsString = this.generateMonthsData()
      .filter(m => data.some(i => i.periodo === m.value))
      .map(m => m.name);
    const montos = data.map(i => i.monto);
    this.updateChart(monthsAsString, [{ data: montos, label: 'Monto neto' }]);
  }
    

}
