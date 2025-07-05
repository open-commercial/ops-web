import { Component, inject, OnInit } from '@angular/core';
import { BarChartDirective } from 'src/app/directives/bar-chart.directive';
import { PeriodoMonto } from 'src/app/models/periodo-monto';
import { EstadisticasService } from 'src/app/services/estadisticas.service';

@Component({
  selector: 'app-compra-anual-chart',
  templateUrl: './compra-anual-chart.component.html',
  styleUrls: ['./compra-anual-chart.component.scss']
})
export class CompraAnualChartComponent extends BarChartDirective implements OnInit {

  estadisticasService: EstadisticasService = inject(EstadisticasService);

  ngOnInit(): void {
    super.ngOnInit();
    this.loadChartData();
  }

  override loadChartData(): void {
    this.loadingData = true;
    this.estadisticasService.getMontoNetoCompradoAnual().subscribe(data => {
      this.handleData(data);
      this.loadingData = false;
    });
  }

  private handleData(data: PeriodoMonto[]): void {
    const periodos = data.map(i => String(i.periodo)).reverse();
    const montos = data.map(i => i.monto).reverse();
    this.updateChart(periodos, [{ data: montos, label: 'Monto neto' }]);
  }
}
