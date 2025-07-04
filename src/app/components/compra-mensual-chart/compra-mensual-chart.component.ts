import { Component, inject, OnInit } from '@angular/core';
import { BarChartDirective } from 'src/app/directives/bar-chart.directive';
import { PeriodoMonto } from 'src/app/models/periodo-monto';
import { EstadisticasService } from 'src/app/services/estadisticas.service';

@Component({
  selector: 'app-compra-mensual-chart',
  templateUrl: './compra-mensual-chart.component.html',
  styleUrls: ['./compra-mensual-chart.component.scss']
})
export class CompraMensualChartComponent extends BarChartDirective implements OnInit {

  selectedYear: number = this.years[0];
  estadisticasService: EstadisticasService = inject(EstadisticasService);

  ngOnInit(): void {
    super.ngOnInit();
    this.loadChartData();
  }

  override loadChartData(): void {
    this.loadingData = true;
    this.estadisticasService.getMontoNetoCompradoMensual(this.selectedYear).subscribe(data => {
      this.handleData(data);
      this.loadingData = false;
    });
  }

  private handleData(data: PeriodoMonto[]): void {
    const monthsAsString = this.generateMonths()
      .filter(m => data.some(i => i.periodo === m.value))
      .map(m => m.name);
    const montos = data.map(i => i.monto);
    this.updateChart(monthsAsString, [{ data: montos, label: 'Monto neto' }]);
  }
}
